const Video = require("../models/Video");

// Upload new video
exports.uploadVideo = async (req, res) => {
  try {
    const { title, class: className, subject, topic, videoUrl, duration, uploadedBy } = req.body;

    if (duration > 90) {
      return res.status(400).json({ message: "Max video duration is 90 seconds" });
    }

    const video = new Video({ title, class: className, subject, topic, videoUrl, duration, uploadedBy });
    await video.save();

    res.status(201).json({ message: "Video uploaded successfully!", video });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin approve/reject video
exports.updateVideoStatus = async (req, res) => {
  try {
    const { status } = req.body; // 0 or 1
    const video = await Video.findById(req.params.id);

    if (!video) return res.status(404).json({ message: "Video not found" });
    if (![0, 1].includes(status)) {
      return res.status(400).json({ message: "Invalid status, use 0 or 1" });
    }

    video.status = status;
    await video.save();

    res.json({ message: "Video status updated!", video });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all videos with status
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
