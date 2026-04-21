const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderModel: { type: String, enum: ["Student", "Teacher"], required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);