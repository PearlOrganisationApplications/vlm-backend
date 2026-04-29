// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  vlmId: {type: String},
  profile: {
    personalDetails: {
      fullName: String,
      nickName: String
    },

    education: {
      class: String,
      board: String,
      medium: String
    },

    location: {
      city: String,
      state: String,
      parentContactNo: String
    },

    academicPreferences: {
      preferredSubjects: [String],
      weakSubjects: [String]
    },

    profilePic: {
      type: String,
      default: null
    }
  },

  planDetails: {
    currentPlan: {
      type: String,
      enum: ["BASIC", "PRO", "PREMIUM"],
      default: "BASIC"
    },

    pricing: {
      basic: Number,
      pro: Number,
      premium: Number
    },

    trial: {
      isActive: {
        type: Boolean,
        default: true
      },
      expiresAt: Date
    }
  },

    wallet: {
    totalCoins: { type: Number, default: 0 },
    totalBalance: { type: Number, default: 0 } // Rupees yahan save honge
  },
  lastSpinTime: { type: Date, default: null } ,

   isActive: {
    type: Boolean,
    default: true
  }


}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);