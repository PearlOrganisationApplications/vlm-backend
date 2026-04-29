const express = require("express");
const { sendOtp, verifyOtp, linkAndFetchStudent, getStudentByIdentifier, getPerformanceAnalytics } = require("../controllers/parent.controller");

const router = express.Router();

router.post("/login/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/get-student-data", getStudentByIdentifier);


module.exports = router ;