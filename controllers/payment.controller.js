// controllers/payment.controller.js
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Student = require("../models/Student");


exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // ✅ PAYMENT SUCCESS

      const Student = require("../models/Student");

      const trialEnd = new Date();
      trialEnd.setHours(trialEnd.getHours() + 72);

      await Student.findOneAndUpdate(
        { userId },
        {
          "planDetails.trial": {
            isActive: true,
            startedAt: new Date(),
            expiresAt: trialEnd,
          },
          "planDetails.currentPlan": "BASIC",
        }
      );

      return res.json({
        success: true,
        message: "Payment verified & trial activated",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.body; // or req.params

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const options = {
      amount: 100, // ₹1 = 100 paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      notes: {
        userId: userId
      }
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};