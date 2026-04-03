const Teacher = require("../models/Teacher");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.registerTeacher = async (req, res) => {
  try {
    const BASE_URL = process.env.BASE_URL;

    // 🔐 Create User
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      email: req.body.email,
      phone: req.body.mobile,
      password: hashedPassword,
      role: "teacher"
    });

    // 📦 Parse JSON fields
    const BasicDetails = JSON.parse(req.body.BasicDetails);
    const QualificationDetails = JSON.parse(req.body.QualificationDetails);
    const ExperienceDetails = JSON.parse(req.body.ExperienceDetails);

    // 📂 FILE HANDLING
    const files = req.files;

    const getFileUrl = (file) =>
      file ? `${BASE_URL}/uploads/${file[0].filename}` : null;

    const teacher = await Teacher.create({
      userId: user._id,

      BasicDetails: {
        ...BasicDetails,
        profilePic: getFileUrl(files.profilePic)
      },

      QualificationDetails: {
        ...QualificationDetails,
        certifications: files.certifications
          ? files.certifications.map(f => `${BASE_URL}/uploads/${f.filename}`)
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
    res.status(500).json({ error: err.message });
  }
};



