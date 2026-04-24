const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getAvailableTests, submitTest, getAttemptHistory, getMaterialsForStudent } = require("../controllers/student.mocktests.controller");

const router = express.Router();

router.get("/get-mocktests", authMiddleware, getAvailableTests);


router.post("/submit-test", authMiddleware, submitTest);

router.get("/mocktest-history", authMiddleware, getAttemptHistory);

router.get("/get-materials", authMiddleware, getMaterialsForStudent)

module.exports = router; 