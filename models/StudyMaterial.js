const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    chapterName: { type: String, required: true },
    chapterNumber: { type: Number },
    contentType: {
      type: String,
      required: true,
      enum: [
        "PDF",
        "VIDEO",
        "PYQ",
        "QUESTION_BANK",
        "TEXTBOOK",
        "SAMPLE_PAPER",
        "WORKSHEET",
        "REVISION_NOTES",
        "FORMULA_SHEET",
        "MOCK_TEST",
        "CHAPTER_SUMMARY",
        "ASSIGNMENTS",
        "IMPORTANT_QUESTIONS",
      ],
    },
    fileUrl: { type: String },
    videoUrl: { type: String },
    className: { type: String, required: true },
    board: { type: String, required: true },
     accessPlan: {
    type: String,
    enum: ["BASIC", "PRO", "PREMIUM"],
    default: "BASIC", 
    required: true
  }
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
