const User = require("../models/User");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")

exports.registerStudent = async (req, res) => {
   console.log("Incoming Body:", req.body);
   console.log("Incoming File:", req.file);
  try {
    let {
      phone,
      email,
      password,
      profile,
      planDetails
    } = req.body;


 try {
      if (typeof profile === "string") profile = JSON.parse(profile);
      if (typeof planDetails === "string") planDetails = JSON.parse(planDetails);
    } catch (e) {
      return res.status(400).json({ message: "Invalid JSON format in profile or planDetails" });
    }


    // 🔍 1. Check existing user
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }


let profilePicUrl = null;
    if (req.file) {
      profilePicUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }


    // 🧑‍💻 2. Create USER
    const user = await User.create({
      phone,
      email,
      password,
      role: "STUDENT"
    });

    // 🎓 3. Create STUDENT PROFILE
    const student = await Student.create({
      userId: user._id,

      profile: {
        personalDetails: {
          fullName: profile.personalDetails.fullName,
          nickName: profile.personalDetails.nickName || ""
        },

        education: {
          class: profile.education.class,
          board: profile.education.board,
          medium: profile.education.medium
        },

        location: {
          city: profile.location.city,
          state: profile.location.state,
          parentContactNo: profile.location.parentContactNo
        },

        academicPreferences: {
          preferredSubjects: profile.academicPreferences.preferredSubjects,
          weakSubjects: profile.academicPreferences.weakSubjects
        },

        profilePic: profilePicUrl  // ✅ as required
      },

      planDetails: {
        pricing: {
          basic: planDetails.basic,
          pro: planDetails.pro,
          premium: planDetails.premium
        },

        currentPlan: "BASIC",

        trial: {
          isActive: false, // ❌ not active yet
          expiresAt: null
        }
      }
    });

    // 🚀 RESPONSE
    res.status(201).json({
      success:  true,
      message: "Registered successfully. Please complete ₹1 payment to activate trial." ,
        data: student 
      
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginStudent = async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const studentData = await Student.findOne({ userId: user._id });

    if (!studentData) {
      return res.status(404).json({ success: false, message: "Student profile data not found" });
    }

    
  //   if (studentData.isActive === false) {
  //   return res.status(403).json({ 
  //     success: false, 
  //     message: "Your account has been deactivated " 
  //   });
  // }

 if (!studentData.vlmId) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 6 digits ka random number
    const generatedId = `VLM-STU-${randomNumber}`;
    
    // Database mein update karein
    studentData.vlmId = generatedId;
    await studentData.save();
  }

  const token = jwt.sign(
    { id: user._id,
       role: user.role ,
      type: "USER"},
    process.env.JWT_SECRET
  );

  res.json({ 
success: true,
message: "Login successfull",
token : token,
data : studentData

  });
};


// controllers/student.controller.js

exports.getStudentByStudentId = async (req, res) => {
  try {
    // 1. URL se Student ki apni _id lena (e.g. /api/student/65abc...)
    const { id } = req.params;

    // Validation: Check karo ki ID valid MongoDB ID hai ya nahi
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Student ID format" });
    }

    // 2. Student table mein uski apni _id se find karna
    const student = await Student.findById(id).populate("userId");

    // 3. Agar student nahi milta
    if (!student) {
      return res.status(404).json({ message: "Student record not found with this ID" });
    }

    // 4. 🔥 TRIAL STATUS LOGIC
    const now = new Date();
    let trialStatus = "inactive";

    // Aapke model ke nested structure ke hisab se check:
    if (student.planDetails && student.planDetails.trial) {
      const { isActive, expiresAt } = student.planDetails.trial;

      if (isActive) {
        if (expiresAt && new Date(expiresAt) > now) {
          trialStatus = "active";
        } else {
          trialStatus = "expired";
        }
      }
    }

    // 5. Response bhejna (Pura Student object + Trial status)
    res.status(200).json({
      success: true,
      student, // Isme profile, wallet, education sab include hai
      trial: {
        status: trialStatus,
        expiresAt: student.planDetails?.trial?.expiresAt || null
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// controllers/student.controller.js

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("userId");

    const now = new Date();

    const formattedStudents = students.map((student) => {
      let trialStatus = "inactive";

      if (student.planDetails?.trial?.isActive) {
        if (student.planDetails.trial.expiresAt > now) {
          trialStatus = "active";
        } else {
          trialStatus = "expired";
        }
      }

      return {
        studentId: student._id,
        userId: student.userId?._id,

        name: student.profile?.personalDetails?.fullName,
        phone: student.userId?.phone,
        email: student.userId?.email,

        plan: student.planDetails?.currentPlan,

        trial: {
          status: trialStatus,
          expiresAt: student.planDetails?.trial?.expiresAt
        },

        createdAt: student.createdAt
      };
    });

    res.json(formattedStudents);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/student.controller.js

exports.updateStudent = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;

    let updateData = {};

    // RAW JSON
    if (req.is("application/json")) {
      updateData = req.body;
    }

    if (req.is("multipart/form-data")) {
      updateData = { ...req.body };

      if (req.body.profile) {
        updateData.profile = JSON.parse(req.body.profile);
      }
    }

    if (req.file) {
      updateData.profile = updateData.profile || {};

      updateData.profile.profilePic =
        "https://api.vlmacademy.co.in/uploads/" + req.file.filename;
    }

    const student = await Student.findOneAndUpdate(
      { userId },
      updateData,
      { new: true }
    );

    res.json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted" });
};



exports.deactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Security check: Find the student profile
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Security check: Ensure the logged-in user owns this student profile
    if (student.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only deactivate your own account" });
    }

    student.isActive = false;
    await student.save();

    res.status(200).json({ success: true, message: "Account deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
