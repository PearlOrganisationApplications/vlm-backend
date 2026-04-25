const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

    parentPhone: {
    type: String,
    required: true,
    unique: true
  },
  linkedStudents: [{
    type: String // Yahan Student ki vlmId save hogi(ex - VLM-STU 2345)
  }],
  otp: {
    code: String,
    expiresAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("Parent", parentSchema);