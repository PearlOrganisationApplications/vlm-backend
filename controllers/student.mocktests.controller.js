const MockTest = require("../models/MockTest");
const TestAttempt = require("../models/TestAttempt");
const Student = require("../models/Student");
const StudyMaterial = require("../models/StudyMaterial");

exports.getAvailableTests = async (req, res) => {
  try {

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile nahi mili" });
    }

    const sClass = student.profile.education.class;
    const { subjectId } = req.query;

    let filter = { 
      className: sClass 
    };

    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const tests = await MockTest.find(filter)
      .populate("subjectId", "name") 
      .select("-questions.correctAnswer")
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: tests.length, 
      data: tests 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { testId, studentAnswers, timeTaken } = req.body;

    const student = await Student.findOne({ userId: req.user.id });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Aapka student profile nahi mila, kripya login karein" 
      });
    }

    const test = await MockTest.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test exist nahi karta" });
    }

    let score = 0;
    let correct = 0;
    let wrong = 0;
    const detailedAnswers = [];

    test.questions.forEach((q, index) => {
      // Dekho bache ne is question ka kya answer diya
      const studentAns = studentAnswers.find(a => a.questionIndex === index);
      
      // Sahi answer check karo
      const isCorrect = studentAns && String(studentAns.selectedOption )=== String(q.correctAnswer);
      
      if (isCorrect) {
        score++;
        correct++;
      } else {
        if (studentAns) wrong++;
      }

    
      detailedAnswers.push({
        questionIndex: index,
        selectedOption: studentAns ? studentAns.selectedOption : "Not Answered",
      isCorrect: isCorrect
      });
    });

    const attempt = await TestAttempt.create({
      studentId: student._id, 
      testId: testId,
      score: score,
      totalQuestions: test.questions.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      answers: detailedAnswers,
      timeTaken: timeTaken
    });

    res.status(200).json({
      success: true,
      message: "Test submitted and result saved!",
      result: {
        score: score,
        totalQuestions: test.questions.length,
        correctAnswers: correct,
        wrongAnswers: wrong,
        attemptId: attempt._id
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getAttemptHistory = async (req, res) => {
  try {
   
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

 
    const history = await TestAttempt.find({ studentId: student._id })
      .populate({
        path: "testId",
        select: "title chapterName totalMarks", 
        populate: { path: "subjectId", select: "name" }
      })
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "History fetch karne mein error aaya",
      error: error.message
    });
  }
};


exports.getMaterialsForStudent = async (req, res) => {
  try {
    const { subjectId } = req.params; 
    const userId = req.user.id;     

    // 1. Student ki profile aur plan ki details nikalo
    const student = await Student.findOne({ userId: userId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile nahi mili"
      });
    }

    const { className, board } = student.profile.education;
    const currentPlan = student.planDetails.currentPlan;

    let allowedPlans = ["BASIC"];
    if (currentPlan === "PRO") {
      allowedPlans = ["BASIC", "PRO"];
    } else if (currentPlan === "PREMIUM") {
      allowedPlans = ["BASIC", "PRO", "PREMIUM"];
    }

    
    const materials = await StudyMaterial.find({
      subjectId: subjectId,
      className: className,
      board: board,
      accessPlan: { $in: allowedPlans } 
    }).sort({ chapterNumber: 1 }); 

    res.status(200).json({
      success: true,
      message: `Materials for plan: ${currentPlan}`,
      count: materials.length,
      data: materials
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Error while fetching the Material details",
      error: error.message
    });
  }
};
