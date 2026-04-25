const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminCheck = require("../middlewares/admin.Middleware");
const { createSubject, uploadMaterial, getStudentSubjects, getContentByCard, createMockTest, getAllSubjects, getMaterials } = require("../controllers/admin.content.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.post("/create/subjects", authMiddleware, adminCheck, createSubject);

router.post("/upload/material",  authMiddleware, adminCheck,upload.single("file"), uploadMaterial);
router.post("/create-mocktest", authMiddleware, adminCheck, createMockTest);

router.get("/get-subjects", authMiddleware, adminCheck, getAllSubjects);

router.get("/get-materials", authMiddleware, adminCheck, getMaterials)
module.exports = router;