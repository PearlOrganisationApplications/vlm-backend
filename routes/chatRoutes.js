const express=  require("express");
const { initiateChat, getChatHistory } = require("../controllers/chat.controller");

const router = express.Router();

router.post("/initiate", initiateChat);

router.get("/history/:roomId", getChatHistory);
module.exports = router ;