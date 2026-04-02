// models/Admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// FIX: Remove 'next' from the parameters and remove next() calls
adminSchema.pre("save", async function () {
  // 1. Check if password is modified
  if (!this.isModified("password")) {
    return; // Just return, don't call next()
  }

  try {
    // 2. Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    // No next() call needed here
  } catch (error) {
    throw error; // Mongoose will catch this and pass it to your controller
  }
});

module.exports = mongoose.model("Admin", adminSchema);