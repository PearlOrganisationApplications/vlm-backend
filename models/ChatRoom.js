const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  participants: [
    {
      participantId: { type: mongoose.Schema.Types.ObjectId, required: true },
      participantModel: { type: String, enum: ["Student", "Teacher"], required: true }
    }
  ],
  lastMessage: { type: String, default: "" },
  unreadCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);