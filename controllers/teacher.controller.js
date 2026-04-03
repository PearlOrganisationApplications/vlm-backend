const Teacher = require("../models/Teacher");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.registerTeacher = async (req, res) => {
  try {
    const BASE_URL = process.env.BASE_URL;

    // ✅ SAFETY CHECKS
    if (!req.body.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // 📦 SAFE JSON PARSE
    let BasicDetails, QualificationDetails, ExperienceDetails;

    try {
      BasicDetails = JSON.parse(req.body.BasicDetails);
      QualificationDetails = JSON.parse(req.body.QualificationDetails);
      ExperienceDetails = JSON.parse(req.body.ExperienceDetails);
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON format" });
    }

    // ✅ CHECK REQUIRED FIELDS
    if (!BasicDetails?.email || !BasicDetails?.mobile) {
      return res.status(400).json({
        message: "Email and Mobile are required inside BasicDetails"
      });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // 👤 CREATE USER (FIXED)
    const user = await User.create({
      email: BasicDetails.email,
      phone: BasicDetails.mobile,
      password: hashedPassword,
      role: "TEACHER"
    });

    // 📂 FILES SAFE ACCESS
    const files = req.files || {};

    const getFileUrl = (file) =>
      file && file.length > 0
        ? `${BASE_URL}/uploads/${file[0].filename}`
        : null;

    // 🚀 CREATE TEACHER
    const teacher = await Teacher.create({
      userId: user._id,

      BasicDetails: {
        ...BasicDetails,
        profilePic: getFileUrl(files.profilePic)
      },

      QualificationDetails: {
        ...QualificationDetails,
        certifications: files.certifications
          ? files.certifications.map(
              (f) => `${BASE_URL}/uploads/${f.filename}`
            )
          : []
      },

      ExperienceDetails: {
        ...ExperienceDetails,

        resume: getFileUrl(files.resume),

        documents: {
          aadharCard: getFileUrl(files.aadharCard),
          experienceDoc: getFileUrl(files.experienceDoc),
          qualificationCert: getFileUrl(files.qualificationCert)
        }
      }
    });

    res.status(201).json({
      message: "Teacher registered successfully",
      teacher
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};




exports.loginTeacher = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 🔍 Find user
    const user = await User.findOne({ phone, role: "teacher" });

    if (!user) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🎫 Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 👤 Get teacher profile
    const teacher = await Teacher.findOne({ userId: user._id });

    res.json({
      message: "Login successful",
      token,
      teacher
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate("userId");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("userId");

    res.json(teachers);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("userId");

    res.json(teachers);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const BASE_URL = process.env.BASE_URL;

    const teacherId = req.params.id;

    let updateData = {};

    // 📦 Handle JSON (raw)
    if (req.is("application/json")) {
      updateData = req.body;
    }

    // 📦 Handle form-data
    else {
      const files = req.files || {};

      let BasicDetails = req.body.BasicDetails
        ? JSON.parse(req.body.BasicDetails)
        : {};

      let QualificationDetails = req.body.QualificationDetails
        ? JSON.parse(req.body.QualificationDetails)
        : {};

      let ExperienceDetails = req.body.ExperienceDetails
        ? JSON.parse(req.body.ExperienceDetails)
        : {};

      const getFileUrl = (file) =>
        file && file.length > 0
          ? `${BASE_URL}/uploads/${file[0].filename}`
          : null;

      updateData = {
        BasicDetails: {
          ...BasicDetails,
          ...(files.profilePic && {
            profilePic: getFileUrl(files.profilePic)
          })
        },

        QualificationDetails: {
          ...QualificationDetails,
          ...(files.certifications && {
            certifications: files.certifications.map(
              (f) => `${BASE_URL}/uploads/${f.filename}`
            )
          })
        },

        ExperienceDetails: {
          ...ExperienceDetails,
          ...(files.resume && {
            resume: getFileUrl(files.resume)
          }),
          documents: {
            ...(files.aadharCard && {
              aadharCard: getFileUrl(files.aadharCard)
            }),
            ...(files.experienceDoc && {
              experienceDoc: getFileUrl(files.experienceDoc)
            }),
            ...(files.qualificationCert && {
              qualificationCert: getFileUrl(files.qualificationCert)
            })
          }
        }
      };
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      updateData,
      { new: true }
    );

    res.json({
      message: "Teacher updated successfully",
      updatedTeacher
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};