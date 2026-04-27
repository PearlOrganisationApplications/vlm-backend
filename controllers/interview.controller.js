const InterviewSlot = require("../models/InterviewSlot")
const Teacher = require("../models/Teacher")

exports.getAvailableSlots = async (req, res) => {
  try {
    const availableSlots = await InterviewSlot.find({ status: "OPEN" }).sort({ date: 1 });
    res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Teacher apna slot book karega
exports.bookMultipleSlots = async (req, res) => {
  try {
    const { teacherId, slotIds } = req.body; 
    // Example: slotIds: ["ID1", "ID2"]

    const updated = await InterviewSlot.updateMany(
      { _id: { $in: slotIds }, status: "OPEN" },
      { $set: { teacherId: teacherId, status: "BOOKED" } }
    );

    const bookedSlotsData = await InterviewSlot.find({
      _id: { $in: slotIds },
      teacherId: teacherId
    });

    res.status(200).json({
      success: true,
      message: `${updated.modifiedCount} slots booked successfully.`,
       data: bookedSlotsData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.handleDemoVideo = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { recordedUrl , subjectId} = req.body; 

    let finalVideoUrl = "";


    if (req.file) {

      finalVideoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    } 
   
    else if (recordedUrl) {
      finalVideoUrl = recordedUrl;
    } 
    else {
      return res.status(400).json({ 
        success: false, 
        message: "Please upload a video file or provide a recorded video URL" 
      });
    }

 const updateQuery = {
      $set: { "ExperienceDetails.demoVideo": finalVideoUrl }
    };

    if (subjectId) {
      updateQuery.$addToSet = { "ExperienceDetails.subjects": subjectId };
    }


    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      updateQuery,
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({
      success: true,
      message: "Demo video saved successfully",
      videoUrl: finalVideoUrl,
        subjectId: subjectId,
      data: updatedTeacher.ExperienceDetails
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};