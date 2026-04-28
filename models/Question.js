const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  subject: { type: String, required: true }, // e.g., "Maths", "Science"
  class: { type: String, required: true },   // Student ki class se match karega (e.g., "10th")
  board: { type: String, required: true },   // Student ke board se match karega (e.g., "CBSE")
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // 4 options ka array
  correctOption: { type: Number, required: true }, // Index: 0, 1, 2, ya 3
  marks: { type: Number, default: 1 }
});

module.exports = mongoose.model("Question", questionSchema);