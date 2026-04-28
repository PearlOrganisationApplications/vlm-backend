const express = require("express");
const router = express.Router();
const reelController = require("../controllers/reelController");

// Routes
router.get("/", reelController.getReels);
router.post("/", reelController.createReel);
router.post("/:id/action", reelController.updateReelAction);
router.post("/:id/status", reelController.updateReelStatus);

module.exports = router;
