const Role = require("../models/Role");

const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const Role = require("../models/Role"); 
      const role = await Role.findById(req.admin.role).populate("permissions");

      if (!role) return res.status(403).json({ message: "Role not found" });

      // ✅ ADD THIS BYPASS:
      if (role.name === "SUPER_ADMIN") {
        return next(); 
      }

      const hasPermission = role.permissions.some(
        (perm) => perm.module === moduleName && perm.actions[action] === true
      );

      if (!hasPermission) return res.status(403).json({ message: "Access Denied" });

      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};

module.exports = checkPermission;