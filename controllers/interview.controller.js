const Interview = require("../models/Interview");

// 1. Teacher Slots select karega
exports.selectSlots = async (req, res) => {
  try {
    const { teacherId, scheduledDate, times } = req.body; 
    // times example: ["10:00 AM", "01:00 PM", "04:30 PM"]

    if (!times || !Array.isArray(times)) {
      return res.status(400).json({ message: "Please provide an array of times." });
    }

    const day = new Date(scheduledDate).toLocaleString('en-us', { weekday: 'long' });

    // Check agar us din ka record pehle se hai
    let interviewEntry = await Interview.findOne({ teacherId, scheduledDate });

    if (interviewEntry) {
      // Naye times add karo jo pehle se nahi hain
      const existingTimes = interviewEntry.slots.map(s => s.time);
      const uniqueNewSlots = times
        .filter(t => !existingTimes.includes(t))
        .map(t => ({ time: t }));

      interviewEntry.slots.push(...uniqueNewSlots);
      await interviewEntry.save();
    } else {
      // Naya record create karo
      interviewEntry = new Interview({
        teacherId,
        scheduledDate,
        day,
        slots: times.map(t => ({ time: t }))
      });
      await interviewEntry.save();
    }

    res.status(201).json({
      message: "Slots scheduled successfully",
      data: interviewEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Demo Video Upload logic
exports.uploadInterviewVideo = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    // Interview document ko update karo video path ke sath
    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      { demoVideo: req.file.path },
      { new: true }
    );

    if (!updatedInterview) {
      return res.status(404).json({ message: "Interview record not found" });
    }

    res.status(200).json({
      message: "Demo video uploaded successfully",
      videoPath: req.file.path,
      data: updatedInterview
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Teacher ke saare scheduled slots dekhne ke liye
exports.getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ teacherId: req.params.teacherId }).sort({ scheduledDate: 1 });
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};