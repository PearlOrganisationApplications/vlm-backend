const Role = require("../models/Role");
module.exports = (moduleName, action) => {
  return (req, res, next) => {
    try {
      console.log("🔐 CHECK PERMISSION");

      const permissions = req.user?.role?.permissions || [];
      console.log("Permissions:", permissions);

      const hasPermission = permissions.some((p) => {
        return (
          p.module === moduleName &&
          p.actions &&
          p.actions[action] === true // 🔥 FIX HERE
        );
      });

      if (!hasPermission) {
        console.log("❌ Permission denied");
        return res.status(403).json({ message: "Access denied" });
      }

      console.log("✅ Permission granted");
      next();

    } catch (err) {
      console.log("❌ PERMISSION ERROR:", err.message);
      res.status(500).json({ message: err.message });
    }
  };
};
