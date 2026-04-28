// controllers/doubtController.js
const Doubt = require("../models/Doubt");
const Student = require("../models/Student");

/**
 * Create Doubt
 */
exports.createDoubt = async (req, res) => {
  try {
    const {
      userId,
      subject,
      topic,
      description,
      files,
      sessionType,
    } = req.body;

    if (!userId || !subject || !topic || !description) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    const student = await Student.findOne({ userId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const doubt = await Doubt.create({
      studentId: student._id,
      userId,
      subject,
      topic,
      description,
      files: files || [],
      sessionType: sessionType || "CHAT",
    });

    return res.status(201).json({
      success: true,
      message: "Doubt created successfully.",
      data: doubt,
    });
  } catch (error) {
    console.error("Create Doubt Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

/**
 * Get All Doubts By User
 */
exports.getUserDoubts = async (req, res) => {
  try {
    const { userId } = req.params;

    const doubts = await Doubt.find({ userId })
      .sort({ createdAt: -1 })
      .populate("studentId", "profile.personalDetails.fullName");

    return res.status(200).json({
      success: true,
      count: doubts.length,
      data: doubts,
    });
  } catch (error) {
    console.error("Get Doubts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

/**
 * Get Single Doubt
 */
exports.getSingleDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;

    const doubt = await Doubt.findById(doubtId)
      .populate("studentId", "profile")
      .populate("userId", "name email");

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: "Doubt not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: doubt,
    });
  } catch (error) {
    console.error("Get Single Doubt Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.switchToAI = async (req, res) => {
    try {
        const { doubtId, studentId } = req.body;

        const updatedDoubt = await Doubt.findOneAndUpdate(
            { _id: doubtId, studentId: studentId },
            { tutorType: "AI", status: "RESOLVED" },
            { new: true }
        );

        if (!updatedDoubt) {
            return res.status(404).json({ 
                success: false, 
                message: "Doubt not found with this ID and Student." 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Switched to AI Tutor", 
            data: updatedDoubt 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Mark as Priority (Screen: Mark as Priority)
exports.markAsPriority = async (req, res) => {
    try {
        const { doubtId, studentId } = req.body;

        const updatedDoubt = await Doubt.findOneAndUpdate(
            { _id: doubtId, studentId: studentId },
            { isPriority: true, status: "PRIORITY" },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Marked as Priority Request",
            details: {
                subject: updatedDoubt.subject,
                topic: updatedDoubt.topic,
                estimatedTime: "Within 1 Hour"
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};