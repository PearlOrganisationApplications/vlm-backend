const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  date: {
    type: Date, // e.g., 2024-05-20
    required: true
  },

  day: {
    type: String,
    required: true
  },
  
  time: {
    type: String, // e.g., "10:00 AM"
    required: true
  },
  status: {
    type: String,
    enum: ["OPEN", "BOOKED", "COMPLETED"],
    default: "OPEN"
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null // Jab teacher book karega tab update hoga
  },
  meetingLink: {
    type: String,
    default: ""
  },
  demoVideo: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("InterviewSlot", slotSchema);