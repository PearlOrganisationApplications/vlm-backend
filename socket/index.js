const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");

const socketConfig = (io) => {
  io.on("connection", (socket) => {
    
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("send_message", async (data) => {
      const { roomId, senderId, senderModel, text } = data;

      const newMessage = await Message.create({ roomId, senderId, senderModel, text });

      await ChatRoom.findByIdAndUpdate(roomId, { lastMessage: text });

      io.to(roomId).emit("receive_message", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = socketConfig;