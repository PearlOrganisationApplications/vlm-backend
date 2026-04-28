const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const rewardController = require("../controllers/rewardController");

// ✅ Debug check
console.log("getAllRewards:", rewardController.getAllRewards);
console.log("getRewardById:", rewardController.getRewardById);

// ✅ Routes
router.get("/", authMiddleware, rewardController.getAllRewards);
router.get("/:id", authMiddleware, rewardController.getRewardById);

module.exports = router;