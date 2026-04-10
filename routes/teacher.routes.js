const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const teacherController = require("../controllers/teacher.controller");

router.post(
  "/register",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "certifications", maxCount: 10 },
    { name: "resume", maxCount: 1 },
    { name: "aadharCard", maxCount: 2 },
    { name: "experienceDoc", maxCount: 5 },
    { name: "qualificationCert", maxCount: 1 }
  ]),
  teacherController.registerTeacher
);

router.post("/TeacherStatus", teacherController.updateTeacherStatus);

router.post("/login", teacherController.loginTeacher);

router.get("/:id", teacherController.getTeacherById);

// 📋 GET ALL
router.get("/", teacherController.getAllTeachers);

// ✏️ UPDATE
router.put(
  "/:id",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "certifications", maxCount: 10 },
    { name: "resume", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "experienceDoc", maxCount: 1 },
    { name: "qualificationCert", maxCount: 1 }
  ]),
  teacherController.updateTeacher
);

router.delete("/:id", teacherController.deleteTeacher);

module.exports = router;