const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  subject: { type: String, required: true },
  
  // Summary Details
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  scoreGained: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }, // Store as Number for easy calculation
  
  // Detailed Analysis (Kaunsa ques sahi hua kaunsa galat)
  attempts: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selectedOption: Number,
      correctOption: Number,
      isCorrect: Boolean
    }
  ],
  
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("TestResult", testResultSchema);