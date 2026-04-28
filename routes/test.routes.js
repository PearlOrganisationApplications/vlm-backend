// routes/testRoutes.js
const express = require("express");
const { createQuestion, bulkUploadQuestions, getQuestions, submitTest, getScoreCard, getTestHistory } = require("../controllers/test.controller");
const router = express.Router();


router.post("/create-question", createQuestion);

router.post("/bulk-upload", bulkUploadQuestions);


router.get("/questions/:studentId", getQuestions);

router.post("/submit", submitTest);


router.get("/scorecard/:resultId",getScoreCard);


router.get("/history/:studentId",getTestHistory);

module.exports = router;