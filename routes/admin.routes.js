const express = require("express");
const router = express.Router();
const controller = require("../controllers/admin.controller");
const checkPermission = require("../middlewares/permission.middleware");
const authMiddleware = require("../middlewares/auth.middleware");

// LOGIN (no auth)
router.post("/login", controller.loginAdmin);

// CREATE
router.post(
  "/create",
  authMiddleware,
  checkPermission("admin", "create"),
  controller.createAdmin
);
console.log("authMiddleware:", typeof authMiddleware);
console.log("controller:", typeof controller.createAdmin);

// GET ALL
router.get(
  "/",
  authMiddleware,
  checkPermission("admin", "read"),
  controller.getAdmins
);

// GET ALL (alt)
router.get(
  "/all",
  authMiddleware, // ✅ FIXED
  checkPermission("admin", "read"),
  controller.getAdmins
);

// GET ONE
router.get(
  "/details/:id",
  authMiddleware, // ✅ FIXED
  checkPermission("admin", "read"),
  controller.getAdmin
);

// UPDATE
router.put(
  "/update/:id",
  authMiddleware, // ✅ FIXED
  checkPermission("admin", "update"),
  controller.updateAdmin
);

// DELETE
router.delete(
  "/delete/:id",
  authMiddleware, // ✅ FIXED
  checkPermission("admin", "delete"),
  controller.deleteAdmin
);

module.exports = router;