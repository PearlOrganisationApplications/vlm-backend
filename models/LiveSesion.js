const mongoose = require("mongoose");

const liveSessionSchema = new mongoose.Schema(
  {
    channelName: { type: String, required: true, unique: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    sessionType: { 
      type: String, 
      enum: ["ONE_ON_ONE", "ONE_TO_MANY"], 
      required: true 
    },
    // ONE_ON_ONE: single invited student
    invitedStudent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // ONE_TO_MANY: all joined students
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxStudents: { type: Number, default: null }, // null = unlimited for ONE_TO_MANY
    isLive: { type: Boolean, default: false },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveSession", liveSessionSchema);