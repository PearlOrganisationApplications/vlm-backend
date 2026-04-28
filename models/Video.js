const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  class: { type: String, required: true }, // e.g. "10th"
  subject: { type: String, required: true }, // e.g. "Physics"
  topic: { type: String, required: true, maxlength: 500 },
  videoUrl: { type: String, required: true }, // uploaded file path or cloud URL
  duration: { type: Number, required: true }, // in seconds (max 90)
  status: { type: Number, enum: [0, 1], default: 0 }, // 0 = pending/reject, 1 = approved
  uploadedBy: { type: String, required: true } // student name/id
}, { timestamps: true });

module.exports = mongoose.model("Video", videoSchema);
