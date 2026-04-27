// controllers/admin.controller.js
const Admin = require("../models/Admin");
const Role = require("../models/Role");
const ActivityLog = require("../models/ActivityLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Reward = require("../models/Reward")
const InterviewSlot = require("../models/InterviewSlot")
// CREATE ADMIN


// CREATE ADMIN (for Postman)
// controllers/admin.controller.js

exports.createAdmin = async (req, res) => {
  try {
    console.log("==== CREATE ADMIN START ====");

    console.log("REQ USER:", req.user); // 🔥 important
    console.log("REQ BODY:", req.body);

    const { name, email, password, role } = req.body;

    const existing = await Admin.findOne({ email });
    console.log("Existing Admin:", existing);

    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // ✅ Validate role
    const roleData = await Role.findById(role);
    console.log("Role Data:", roleData);

    if (!roleData) {
      console.log("❌ Role not found");
      return res.status(400).json({ message: "Invalid role ID" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role,
    });

    console.log("Created Admin:", admin);

    const populatedAdmin = await Admin.findById(admin._id)
      .populate({
        path: "role",
        populate: { path: "permissions" },
      })
      .select("-password");

    console.log("Populated Admin:", populatedAdmin);

    console.log("==== CREATE ADMIN END ====");

    res.status(201).json({
      message: "Admin created successfully",
      admin: populatedAdmin,
    });

  } catch (error) {
    console.log("❌ CREATE ADMIN ERROR:", error);
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
          path: "permissions",
        },
      })
      .select("-password"); // ✅ hide password

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

  const token = jwt.sign(
    {
      id: admin._id,
      type: "ADMIN", // ✅ FIX
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    admin,
    permissions: admin.role.permissions,
  });
};


exports.initLogic = async (req, res) => {
    const defaultLogic = [
        { optionName: "Option 1", coins: 10, rupees: 1, isTryAgain: false },
        { optionName: "Option 2", coins: 15, rupees: 2, isTryAgain: false },
        { optionName: "Option 3", coins: 20, rupees: 3, isTryAgain: false },
        { optionName: "Option 4", coins: 25, rupees: 4, isTryAgain: false },
        { optionName: "Option 5", coins: 100, rupees: 10, isTryAgain: false },
        { optionName: "Try Again", coins: 0, rupees: 0, isTryAgain: true }
    ];
    await Reward.deleteMany({});
    await Reward.insertMany(defaultLogic);
    res.json({ message: "Reward logic set successfully!" });
};


exports.updateValue = async (req, res) => {
    const updated = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Updated", updated });
};


exports.createSlots = async (req, res) => {
  try {
    const { date, times, status } = req.body; 
    // Example: date: "2024-06-25", times: ["10:00 AM", "02:00 PM"], status: "OPEN"

    if (!date || !times || !Array.isArray(times)) {
      return res.status(400).json({ 
        success: false, 
        message: "Date and an array of times are required." 
      });
    }

    // Date se Day nikalne ka logic (e.g., "Tuesday")
    const dayName = new Date(date).toLocaleString('en-us', { weekday: 'long' });

    // Data prepare karein
    const slotsData = times.map(time => ({
      date: new Date(date),
      day: dayName,
      time: time,
      status: status || "OPEN", // Agar body mein status hai toh wo, nahi toh "OPEN"
      teacherId: null,
    
    }));

    // Database mein insert karein
    // insertMany() function humein wo saare documents return karta hai jo save huye hain
    const createdSlots = await InterviewSlot.insertMany(slotsData);

    // Response mein message aur slots dono bhejein
    res.status(201).json({ 
      success: true,
      message: `${createdSlots.length} slots created successfully.`,
      data: createdSlots // Isme saare created slots ki details hogi (_id ke sath)
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};