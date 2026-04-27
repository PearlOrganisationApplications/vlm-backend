const express = require("express");
const router = express.Router();


const interviewController = require("../controllers/interview.controller");



const upload = require("../middlewares/upload.middleware");

router.get("/available-slots", interviewController.getAvailableSlots);


router.post("/book-slot", interviewController.bookMultipleSlots);

router.patch("/upload-video/:teacherId",upload.single("demoVideo"), interviewController.handleDemoVideo)

module.exports = router;