const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");

// ⚠️ IMPORTANT: use updated auth middleware (supports user + admin)
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * 🧾 Create Razorpay Order (₹1)
 */
router.post(
  "/order",
  authMiddleware,
  paymentController.createOrder
);

/**
 * ✅ Verify Payment & Activate Trial (NO WEBHOOK)
 */
router.post(
  "/verify",
  authMiddleware,
  paymentController.verifyPayment
);

module.exports = router;