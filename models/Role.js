// models/Role.js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // ✅ no enum
    trim: true,
  },

  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
    },
  ],
});

module.exports = mongoose.model("Role", roleSchema);