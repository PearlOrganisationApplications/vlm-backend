const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");

// Student upload video
router.post("/", videoController.uploadVideo);

// Admin approve/reject
// router.post("/:id/status", videoController.updateVideoStatus);

// Get all videos
router.get("/", videoController.getVideos);

module.exports = router;
