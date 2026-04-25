const User = require("../models/User");
const Parent = require("../models/Parent");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");


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