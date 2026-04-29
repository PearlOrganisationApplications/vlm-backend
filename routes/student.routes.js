// routes/student.routes.js

const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// ==========================
// PUBLIC ROUTES
// ==========================

// Register
router.post("/register", upload.single("profilePic"),studentController.registerStudent);

// Login
router.post("/login", studentController.loginStudent);


// ==========================
// PROTECTED ROUTES
// ==========================

// Get ALL students
router.get("/", authMiddleware, studentController.getAllStudents);


router.patch("/deactivate/:id",authMiddleware, studentController.deactivateStudent );

// Get student by USER ID (🔥 IMPORTANT)
router.get("/user/:id", studentController.getStudentByStudentId);

// Get student by STUDENT ID



// ✅ Supports BOTH raw + form-data
router.put(
  "/update",
  authMiddleware,
  upload.single("profilePic"), // optional file
  studentController.updateStudent
);
// Delete
router.delete("/:id", authMiddleware, studentController.deleteStudent);


module.exports = router;