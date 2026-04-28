const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        optionName: String,
        coins: { type: Number, default: 0 },
        rupees: { type: Number, default: 0 },
        isTryAgain: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);