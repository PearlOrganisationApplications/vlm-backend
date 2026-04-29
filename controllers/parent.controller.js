const User = require("../models/User");
const Parent = require("../models/Parent");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const TestResult = require("../models/TestResult")

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    const studentRecord = await Student.findOne({ "profile.location.parentContactNo": phone });

    if (!studentRecord) {
      return res.status(404).json({ 
        success: false, 
        message: "Ye number kisi bhi student ke Parent Contact mein registered nahi hai." 
      });
    }

    let user = await User.findOne({ phone });

    if (!user) {

      user = await User.create({
        phone,
        password: Math.random().toString(36).slice(-8), 
        role: "PARENT"
      });
    } else {
     
      if (user.role !== "PARENT" && user.role !== "ADMIN") {
          user.role = "PARENT"; 
          await user.save();
      }
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    await Parent.findOneAndUpdate(
      { userId: user._id },
      { parentPhone: phone, otp: { code: otpCode, expiresAt } },
      { upsert: true }
    );

    console.log(`OTP for Parent (${phone}): ${otpCode}`);
    res.status(200).json({ success: true, message: "OTP sent successfully" , otp: otpCode });

  } catch (error) {
   
    if (error.code === 11000) {
        return res.status(400).json({ success: false, message: "Phone number already exists in our system." });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};



exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;


    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone number and OTP are required." });
    }

   
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: "User record not found." });
    }


    const parentRecord = await Parent.findOne({ userId: user._id });

    if (!parentRecord || !parentRecord.otp || !parentRecord.otp.code) {
      return res.status(400).json({ success: false, message: "No OTP found. Please request OTP first." });
    }

    if (parentRecord.otp.code !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please check and try again." });
    }

    if (new Date() > parentRecord.otp.expiresAt) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    parentRecord.otp.code = undefined;
    parentRecord.otp.expiresAt = undefined;
    await parentRecord.save();

    // 7. JWT Token generate karein
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, // Yahan apni secret key rakhein
      { expiresIn: "7d" } // Token ki validity (e.g., 7 din)
    );

    // 8. Response bhejein
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      parentUserId: user._id,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getStudentByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.body; 

    if (!identifier) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a Student ID or Parent Contact Number." 
      });
    }

    // Database mein search logic
    const studentData = await Student.findOne({
      $or: [
        { vlmId: identifier }, 
        { "profile.location.parentContactNo": identifier } 
      ]
    }).populate("userId", "phone email"); 

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: "No student found with the provided details."
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Student details fetched successfully.",
      data: studentData
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const studentId =req.body; // Login user ki ID

    // 1. Overall Progress Trend (Last 4 Weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const trendData = await TestResult.aggregate([
      { $match: { studentId, submittedAt: { $gte: fourWeeksAgo } } },
      {
        $group: {
          _id: { $week: "$submittedAt" },
          avgScore: { $avg: { $multiply: [{ $divide: ["$scoreGained", "$totalMarks"] }, 100] } },
          date: { $first: "$submittedAt" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 2. Subject-Wise Performance (Your Score vs Class Average)
    const subjectWise = await TestResult.aggregate([
      {
        $facet: {
          yourScores: [
            { $match: { studentId } },
            { $group: { _id: "$subject", yourAvg: { $avg: "$accuracy" } } }
          ],
          classAverage: [
            { $group: { _id: "$subject", classAvg: { $avg: "$accuracy" } } }
          ]
        }
      }
    ]);

    // 3. Weak Topics (Identifying subjects with accuracy < 50%)
    const weakTopics = await TestResult.find({ studentId, accuracy: { $lt: 50 } })
      .limit(5)
      .select("subject");

    // 4. Overall MCQ Accuracy
    const totalStats = await TestResult.aggregate([
      { $match: { studentId } },
      { $group: { _id: null, avgAccuracy: { $avg: "$accuracy" } } }
    ]);

    // Final Response Formatting
    res.status(200).json({
      status: "success",
      data: {
        overall_trend: trendData.map((item, index) => ({
          week: `W${index + 1}`,
          score: Math.round(item.avgScore)
        })),
        subject_performance: subjectWise[0].yourScores.map(subject => {
          const classAvg = subjectWise[0].classAverage.find(c => c._id === subject._id);
          return {
            subject: subject._id,
            your_score: Math.round(subject.yourAvg),
            class_avg: classAvg ? Math.round(classAvg.classAvg) : 0
          };
        }),
        mcq_accuracy: totalStats.length > 0 ? Math.round(totalStats[0].avgAccuracy) : 0,
        weak_topics: [...new Set(weakTopics.map(t => t.subject))], // Unique subjects
        study_hours_this_week: 28.5, // Note: Yeh data StudySession model se aayega
        report_url: "https://api.vlm.com/generate-pdf/" + studentId
      }
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
