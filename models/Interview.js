const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true
  },
  scheduledDate: {
    type: Date, // Format: YYYY-MM-DD
    required: true
  },
  day: {
    type: String, // e.g., "Monday"
    required: true
  },
  slots: [{
    time: { type: String, required: true }, // e.g., "10:00 AM"
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
      default: "PENDING"
    }
  }],
  demoVideo: {
    type: String // File path save hoga yahan
  },
  meetingLink: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);