const Student = require("../models/Student");

const Reward = require("../models/Reward")

exports.spinNow = async (req, res) => {
  try {
    const userId = req.user._id;
    const student = await Student.findOne({ userId: userId });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student profile nahi mili!" 
      });
    }

    const now = new Date();
    if (student.lastSpinTime) {
      const diffInMs = now - new Date(student.lastSpinTime);
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (diffInHours < 24) {
        const remainingHours = Math.ceil(24 - diffInHours);
        return res.status(400).json({
          success: false,
          message: `Aapne aaj ka spin kar liya hai. ${remainingHours} ghante baad koshish karein.`,
        });
      }
    }

    const rewards = await Reward.find();

    if (rewards.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rewards system abhi chalu nahi hai (Admin setup required).",
      });
    }

    const randomIndex = Math.floor(Math.random() * rewards.length);
    const selectedReward = rewards[randomIndex];

    student.lastSpinTime = now; 

    if (!selectedReward.isTryAgain) {
      student.wallet.totalCoins += selectedReward.coins;
      student.wallet.totalBalance += selectedReward.rupees;
    }

    await student.save();
    return res.status(200).json({
      success: true,
      message: selectedReward.isTryAgain ? "Try Again! Kuch nahi mila." : "Badhai ho! Aapne reward jeeta.",
      reward: {
        option: selectedReward.optionName,
        coinsWon: selectedReward.coins,
        rupeesWon: selectedReward.rupees,
        isTryAgain: selectedReward.isTryAgain
      },
      updatedWallet: {
        totalCoins: student.wallet.totalCoins,
        totalBalance: student.wallet.totalBalance
      }
    });

  } catch (error) {
    console.error("Spin Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server mein koi kharabhi aayi hai", 
      error: error.message 
    });
  }
};