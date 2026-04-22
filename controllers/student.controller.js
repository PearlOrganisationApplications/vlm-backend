const User = require("../models/User");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const Subject = require("../models/Subject");
const StudyMaterial = require("../models/StudyMaterial")


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

  const token = jwt.sign(
    { id: user._id,
       role: user.role ,
      type: "USER"},
    process.env.JWT_SECRET
  );

  res.json({ token });
};


// controllers/student.controller.js


exports.getStudentByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await Student.findOne({ userId }).populate("userId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔥 TRIAL STATUS LOGIC
    const now = new Date();

    let trialStatus = "inactive";

    if (student.planDetails.trial.isActive) {
      if (student.planDetails.trial.expiresAt > now) {
        trialStatus = "active";
      } else {
        trialStatus = "expired";
      }
    }

    res.json({
      student,
      trial: {
        status: trialStatus,
        expiresAt: student.planDetails.trial.expiresAt
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // FORM-DATA
    if (req.is("multipart/form-data")) {
      updateData = { ...req.body };

      if (req.body.profile) {
        updateData.profile = JSON.parse(req.body.profile);
      }
    }

    // ✅ FILE HANDLING WITH FULL URL
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


// Example Controller Logic for Student
exports.getStudentSubjects = async (req, res) => {
  try {
    // 1. Student ki profile find karein
    const student = await Student.findOne({ userId: req.user.id });
    const { class: sClass, board: sBoard } = student.profile.education;

    // 2. Sirf wahi subjects layein jo student ki class/board ke hain
    const subjects = await Subject.find({ className: sClass, board: sBoard });

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Filtered Content API
exports.getContentByCard = async (req, res) => {
  try {
    const { contentType } = req.query; // Card se type aayega: PYQ, VIDEO, etc.
    const student = await Student.findOne({ userId: req.user.id });
    const { class: sClass, board: sBoard } = student.profile.education;

    // Matching content find karein
    const materials = await StudyMaterial.find({ 
      className: sClass, 
      board: sBoard,
      contentType: contentType 
    }).populate("subjectId", "name");

    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};