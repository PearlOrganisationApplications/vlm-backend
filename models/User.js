// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["STUDENT", "TEACHER", "PARENT"],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);