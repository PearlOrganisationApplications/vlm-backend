const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    creator: { type: String, required: true },
    caption: { type: String, required: true },
    hashtags: [String],
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    videoUrl: { type: String, required: true },
    status: { type: Number, enum: [0, 1], default: 0 } // 0 = reject, 1 = approved
}, { timestamps: true });

module.exports = mongoose.model("Reel", reelSchema);
