// models/Permission.js
const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  name: String, // e.g. "VIEW_DASHBOARD"

  module: String, // e.g. "dashboard", "orders", "users"

  actions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Permission", permissionSchema);