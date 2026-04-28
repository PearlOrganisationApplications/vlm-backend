const Reward = require("../models/Reward");

// ✅ Get All Rewards
const getAllRewards = async (req, res) => {
  try {
    let query = {};

    if (req.role === "USER") {
      query.userId = req.user._id;
    }

    const rewards = await Reward.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get Reward By ID
const getRewardById = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reward,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ IMPORTANT EXPORT (ye sabse important hai)
module.exports = {
  getAllRewards,
  getRewardById,
};