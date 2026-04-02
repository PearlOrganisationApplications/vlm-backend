// models/Role.js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["SUPER_ADMIN", "MANAGER", "SUPPORT", "FINANCE", "MARKETING"],
    required: true,
  },

  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
    },
  ],
});

module.exports = mongoose.model("Role", roleSchema);