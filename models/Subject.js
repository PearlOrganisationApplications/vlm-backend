const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Subject name is required"], trim: true },
  className: { type: String, required: true }, 
  board: { type: String, required: true },     
  thumbnail: { type: String, default: "default-subject.png" }
}, { timestamps: true });

subjectSchema.index({ name: 1, className: 1, board: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);