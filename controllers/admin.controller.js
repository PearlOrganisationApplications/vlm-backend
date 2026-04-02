// controllers/admin.controller.js
const Admin = require("../models/Admin");
const Role = require("../models/Role");
const ActivityLog = require("../models/ActivityLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// CREATE ADMIN


// CREATE ADMIN (for Postman)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET ALL ADMINS
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate({
        path: "role",
        populate: {
          path: "permissions"
        }
      });

    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET SINGLE
exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .populate({
        path: "role",
        populate: {
          path: "permissions"
        }
      });

    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateAdmin = async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  await ActivityLog.create({
    admin: req.admin._id,
    action: "UPDATE_ADMIN",
    module: "ADMIN",
    details: admin,
  });

  res.json(admin);
};

// DELETE
exports.deleteAdmin = async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);

  await ActivityLog.create({
    admin: req.admin._id,
    action: "DELETE_ADMIN",
    module: "ADMIN",
  });

  res.json({ message: "Deleted" });
};

// LOGIN
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).populate({
    path: "role",
    populate: { path: "permissions" },
  });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);

  res.json({
    token,
    admin,
    permissions: admin.role.permissions, // send for sidebar
  });
};