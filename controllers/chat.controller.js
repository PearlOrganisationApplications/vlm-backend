const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

exports.initiateChat = async (req, res) => {
    const { studentId, teacherId } = req.body;
    try {

        let room = await ChatRoom.findOne({
            "participants.participantId": { $all: [studentId, teacherId] }
        });

        if (!room) {
            room = await ChatRoom.create({
                participants: [
                    { participantId: studentId, participantModel: "Student" },
                    { participantId: teacherId, participantModel: "Teacher" }
                ]
            });
        }
        res.status(200).json({ success: true, roomId: room._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const messages = await Message.find({ roomId: req.params.roomId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};