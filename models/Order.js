const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String, // या mongoose.Schema.Types.ObjectId अगर आप User model use kar rahe hain
    required: true
  },
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Razorpay Order ID (order_abc123)
  amount: { 
    type: Number, 
    required: true 
  }, // Amount paise mein hota hai (100 = ₹1)
  currency: { 
    type: String, 
    default: "INR" 
  },
  receipt: { 
    type: String 
  },
  status: { 
    type: String, 
    default: "created" 
  }, // created, attempted, paid
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Order', OrderSchema);