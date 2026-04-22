const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    optionName: String,
    coins: { type: Number, default: 0 },
    rupees: { type: Number, default: 0 },
    isTryAgain: { type: Boolean, default: false }
});

module.exports = mongoose.model('Reward', rewardSchema);