const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  BasicDetails: {
    profilePic: String,
    fullName: String,
    gender: String,
    dob: Date,

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },

    email: String,
    mobile: String
  },

  QualificationDetails: {
    degree: String,
    college: String,
    passingYear: String,
    teachingQualification: String,
    bed: Boolean,

    certifications: [String] // multiple file URLs
  },

  ExperienceDetails: {
    experience: {
      years: Number,
      months: Number
    },

    teachingMode: String, // online/offline/hybrid
    typeOfExperience: String,

    resume: String,
    shortSummary: String,

    subjects: [String],

    classes: {
      range: String,   // "1-4", "6-8"
      individual: [String]
    },

    teachingBoards: [String],
    teachingLanguages: [String],

    documents: {
      aadharCard: String,
      experienceDoc: String,
      qualificationCert: String
    }
  },
demoVideo: {
  type: String,
  default : ""
},
  isVerified: {
    type: Boolean,
    default: false
  }
  ,
  status: {
  type: String,
  enum: ["PENDING", "APPROVED", "REJECTED"],
  default: "PENDING"
}

}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);