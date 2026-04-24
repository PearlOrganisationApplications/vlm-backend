// controllers/payment.controller.js
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Student = require("../models/Student");
const Order = require("../models/Order")

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

    const razorpayOrder = await razorpay.orders.create(options);


      const newOrder = new Order({
      userId: userId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, 
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      status: razorpayOrder.status,
      // paymentStatus: 'Pending' // agar aapke model mein ye field hai
    });

     await newOrder.save();
    res.json(razorpayOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    
       const count = parseInt(req.query.count) || 10; 
    const skip = parseInt(req.query.skip) || 0;

    const orders = await Order.find()
    .sort({ createdAt: -1 }) 
      .limit(count)
      .skip(skip);;

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({
      success: true,
      total : orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // URL se userId lena
    const userOrders = await Order.find({ userId: userId }).sort({ createdAt: -1 });

    if (!userOrders || userOrders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(userOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};