const express = require("express");
const router = express.Router();

const interviewController = require("../controllers/interview.controller");

const upload = require("../middlewares/upload.middleware"); 


router.post("/select-slots", interviewController.selectSlots);

router.patch(
  "/upload-video/:interviewId", 
  upload.single("demoVideo"), 
  interviewController.uploadInterviewVideo
);

router.get("/teacher/:teacherId", interviewController.getMyInterviews);


router.delete("/remove-slot", interviewController.removeTimeSlot);

module.exports = router;