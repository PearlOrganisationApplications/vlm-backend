const Permission = require("../models/Permission");
const Role = require("../models/Role");


// CREATE
exports.createPermission = async (req, res) => {
  try {
    // You can now pass the actions object directly in the body
    const permission = await Permission.create(req.body);
    
    res.status(201).json({
      message: "Permission created successfully",
      data: permission
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE
exports.updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Use $set to ensure we only update what is sent
      { new: true, runValidators: true } // runValidators ensures true/false type safety
    );

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    res.json({
      message: "Permission updated successfully",
      data: permission
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add or Remove permission IDs from a Role
exports.updateRolePermissionsList = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body; // Expecting an array of IDs: ["id1", "id2"]

    const role = await Role.findByIdAndUpdate(
      roleId,
      { permissions: permissionIds },
      { new: true }
    ).populate("permissions");

    res.json({
      message: "Role permissions list updated",
      data: role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET ALL, GET ONE, DELETE (Keep as you have them, just add try/catch)
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE PERMISSION
exports.getPermission = async (req, res) => { // <--- Make sure this is singular
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }
    res.json(permission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
exports.deletePermission = async (req, res) => {
  await Permission.findByIdAndDelete(req.params.id);
  res.json({ message: "Permission deleted" });
};