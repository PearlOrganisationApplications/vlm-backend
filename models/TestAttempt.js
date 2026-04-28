const mongoose = require("mongoose");

const testAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest", required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number },
  correctAnswers: { type: Number },
  wrongAnswers: { type: Number },
  answers: [{
    questionIndex: Number,
    selectedOption: {
      type: String
    },
    isCorrect: Boolean
  }],
  timeTaken: { type: Number } // Seconds mein
}, { timestamps: true });

module.exports = mongoose.model("TestAttempt", testAttemptSchema);