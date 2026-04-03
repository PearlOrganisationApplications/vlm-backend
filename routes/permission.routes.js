const express = require("express");
const router = express.Router();
const controller = require("../controllers/permission.controller");
const checkPermission = require("../middlewares/permission.middleware");
const authMiddleware = require("../middlewares/auth.middleware"); // 1. Import it

// 2. Protect all routes in this file with authMiddleware
router.use(authMiddleware); 
console.log("create:", typeof controller.createPermission);
console.log("getAll:", typeof controller.getPermissions);
console.log("getOne:", typeof controller.getPermission); // Check this one!
console.log("update:", typeof controller.updatePermission);
console.log("delete:", typeof controller.deletePermission);
console.log("checkPerm:", typeof checkPermission);

// CREATE
router.post(
  "/create",
  // checkPermission("permission", "create"),
  controller.createPermission
);

// GET ALL
router.get(
  "/",
// checkPermission("admin", "read"),
  controller.getPermissions
);

// GET SINGLE
router.get(
  "/:id",
  // checkPermission("permission", "read"),
  controller.getPermission
);

// UPDATE
router.put(
  "/:id",
  // checkPermission("permission", "update"),
  controller.updatePermission
);

// Update a specific permission belonging to a specific role
router.put("/:roleId/permissions/:permissionId", authMiddleware, controller.updateRolePermissionsList);

// DELETE
router.delete(
  "/:id",
  // checkPermission("permission", "delete"),
  controller.deletePermission
);

module.exports = router;