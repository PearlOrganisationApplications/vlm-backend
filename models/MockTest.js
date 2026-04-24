const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  className: { type: String, required: true },
  board: { type: String, required: true },
  chapterName: { type: String }, 
  duration: { type: Number },
  totalMarks: { type: Number, required: true },
  
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // 4 options
    correctAnswer: { type: String, required: true }, 
    explanation: { type: String } 
  }],
  
  isPremium: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("MockTest", mockTestSchema);