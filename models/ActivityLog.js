// models/ActivityLog.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    action: String, // CREATE_USER, DELETE_ORDER

    module: String,

    details: Object,

    ip: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);