// models/Doubt.js
const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    files: [
      {
        type: String,
      },
    ],

    sessionType: {
      type: String,
      enum: ["CHAT", "AUDIO", "VIDEO"],
      default: "CHAT",
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doubt", doubtSchema);