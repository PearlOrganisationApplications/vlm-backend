const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { spinNow } = require("../controllers/spin.controller");

const router = express.Router();


router.post("/spin-now",  authMiddleware, spinNow);
module.exports = router;