// routes/doubtRoutes.js
const express = require("express");
const router = express.Router();
const doubtController = require("../controllers/doubtController");

router.post("/create", doubtController.createDoubt);
router.get("/user/:userId", doubtController.getUserDoubts);
router.get("/:doubtId", doubtController.getSingleDoubt);

module.exports = router;