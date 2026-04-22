const express = require("express");
const router = express.Router();
const controller = require("../controllers/admin.controller");
const checkPermission = require("../middlewares/permission.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const adminCheck = require("../middlewares/admin.Middleware");

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


router.post("/init", authMiddleware,adminCheck, controller.initLogic);

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

router.put("/admin/update/:id", authMiddleware,adminCheck, controller.updateValue);
// DELETE
router.delete(
  "/delete/:id",
  authMiddleware, // ✅ FIXED
  checkPermission("admin", "delete"),
  controller.deleteAdmin
);

module.exports = router;