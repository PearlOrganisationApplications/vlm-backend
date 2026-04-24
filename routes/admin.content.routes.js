const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminCheck = require("../middlewares/admin.Middleware");
const { createSubject, uploadMaterial, getStudentSubjects, getContentByCard, createMockTest } = require("../controllers/admin.content.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.post("/create/subjects", authMiddleware, adminCheck, createSubject);

router.post("/upload/material",  authMiddleware, adminCheck,upload.single("file"), uploadMaterial);
router.post("/create-mocktest", authMiddleware, adminCheck, createMockTest);


module.exports = router;