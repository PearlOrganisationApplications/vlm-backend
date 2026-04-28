const Student = require("../models/Student");
const Question = require("../models/Question");
const TestResult = require("../models/TestResult");
const Subject = require("../models/Subject")
// 1. Fetch Personalized Questions
exports.getQuestions = async (req, res) => {
  try {
    const { studentId } = req.params;
    let { subject } = req.query;

    if (!subject) return res.status(400).json({ message: "Subject is required in query" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Profile se data nikalna
    const sClass = student.profile.education.class.trim(); // "12"
    const sBoard = student.profile.education.board.trim(); // "CBSE"
    const { preferredSubjects, weakSubjects } = student.profile.academicPreferences;

    const allSubjects = [...preferredSubjects, ...weakSubjects];

    // Subject check (Case-insensitive)
    const hasSubject = allSubjects.some(s => s.toLowerCase() === subject.toLowerCase());
    if (!hasSubject) {
      return res.status(400).json({ message: `Subject '${subject}' aapki profile mein nahi hai.` });
    }

    // DEBUGGING: Console mein check karein backend kya dhoond raha hai
    console.log(`Searching Questions for -> Class: ${sClass}, Board: ${sBoard}, Subject: ${subject}`);

    // Flexible Search using Regex (Case-insensitive)
    const questions = await Question.find({
      class: { $regex: new RegExp(`^${sClass}$`, 'i') }, 
      board: { $regex: new RegExp(`^${sBoard}$`, 'i') },
      subject: { $regex: new RegExp(`^${subject}$`, 'i') }
    }).limit(10);

    if (questions.length === 0) {
      return res.status(404).json({ 
        message: "No questions found.",
        debugInfo: {
            searchedClass: sClass,
            searchedBoard: sBoard,
            searchedSubject: subject
        }
      });
    }

    res.status(200).json({ success: true, count: questions.length, questions });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Submit Test & Calculate Results
exports.submitTest = async (req, res) => {
  try {
    const { studentId, subject, answers } = req.body;

    let correctCount = 0;
    let totalMarks = 0;
    let scoreGained = 0;
    let attemptDetails = [];

    for (let ans of answers) {
      const q = await Question.findById(ans.questionId);
      if (q) {
        totalMarks += q.marks;
        const isCorrect = q.correctOption === Number(ans.selectedOption);

        if (isCorrect) {
          correctCount++;
          scoreGained += q.marks;
        }

        // Detailed analysis ke liye ye array zaroori hai
        attemptDetails.push({
          questionId: q._id,
          selectedOption: Number(ans.selectedOption),
          correctOption: q.correctOption,
          isCorrect: isCorrect
        });
      }
    }

    const totalQuestions = answers.length;

    // --- FIX: Accuracy ko Number ki tarah calculate karein (Bina % ke) ---
    const calculatedAccuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const newResult = new TestResult({
      studentId,
      subject,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: totalQuestions - correctCount,
      scoreGained,
      totalMarks,
      accuracy: calculatedAccuracy, // Sirf Number jayega (e.g. 100.00)
      attempts: attemptDetails       // Detailed report ke liye ye save hona chahiye
    });

    await newResult.save();

    res.status(201).json({
      success: true,
      message: "Test submitted successfully",
      resultId: newResult._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.createQuestion = async (req, res) => {
  try {
    const { subject, class: qClass, board, questionText, options, correctOption, marks } = req.body;

    // Validation
    if (!subject || !qClass || !board || !questionText || !options || correctOption === undefined) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const newQuestion = new Question({
      subject,
      class: qClass,
      board,
      questionText,
      options,
      correctOption,
      marks
    });

    await newQuestion.save();
    res.status(201).json({ success: true, message: "Question created successfully", data: newQuestion });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Bulk Upload Questions (Ek saath 10-20 questions daalne ke liye)
exports.bulkUploadQuestions = async (req, res) => {
  try {
    const { questions } = req.body; // Array of question objects

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions array is required." });
    }

    const insertedQuestions = await Question.insertMany(questions);
    res.status(201).json({
      success: true,
      message: `${insertedQuestions.length} questions uploaded successfully`,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getScoreCard = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await TestResult.findById(resultId)
      .populate({ path: 'studentId', select: 'profile.personalDetails.fullName' })
      .populate({ path: 'attempts.questionId', select: 'questionText options correctOption explanation' });

    if (!result) return res.status(404).json({ message: "Scorecard not found!" });

    // DB se number uthakar format karein
    const accValue = result.accuracy || 0;
    const accDisplay = `${accValue.toFixed(0)}%`; // UI ke liye "100%"

    const detailedAnalysis = (result.attempts || []).map(item => ({
      questionText: item.questionId ? item.questionId.questionText : "Question Deleted",
      options: item.questionId ? item.questionId.options : [],
      userAnswerIndex: item.selectedOption,
      correctAnswerIndex: item.questionId ? item.questionId.correctOption : null,
      isCorrect: item.isCorrect,
      explanation: item.questionId?.explanation || "Practice more!"
    }));

    res.status(200).json({
      success: true,
      data: {
        header: {
          studentName: result.studentId?.profile?.personalDetails?.fullName || "Aryan",
          message: accValue >= 70 ? "Well Done!" : "Keep Practicing!"
        },
        topCards: {
          score: {
            obtained: result.scoreGained,
            total: result.totalMarks,
            display: `${result.scoreGained}/${result.totalMarks}`
          },
          accuracy: {
            value: accValue,
            display: accDisplay
          }
        },
        performanceOverview: {
            correct: result.correctAnswers,
            wrong: result.incorrectAnswers,
            totalQuestions: result.totalQuestions
        },
        viewExplanation: detailedAnalysis 
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 6. Get Student's All Test History (Optional - for Profile Page)
exports.getTestHistory = async (req, res) => {
    try {
      const { studentId } = req.params;
      const history = await TestResult.find({ studentId }).sort({ submittedAt: -1 });
  
      res.status(200).json({
        success: true,
        count: history.length,
        history
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };