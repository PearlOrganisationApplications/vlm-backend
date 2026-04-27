const mongoose = require('mongoose');

const spinHistorySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  rewardName: String,
  coinsWon: { type: Number, default: 0 },
  rupeesWon: { type: Number, default: 0 },
  isTryAgain: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpinHistory', spinHistorySchema);