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
    // answers format: [{ questionId: "...", selectedOption: 2 }, { questionId: "...", selectedOption: 0 }]

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: "No answers submitted" });
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let totalScoreGained = 0;
    let totalPossibleMarks = 0;
    let detailedBreakdown = [];

    // Loop through each answer submitted by the student
    for (let ans of answers) {
      const question = await Question.findById(ans.questionId);

      if (question) {
        totalPossibleMarks += question.marks;
        const isCorrect = question.correctOption === ans.selectedOption;

        if (isCorrect) {
          correctCount++;
          totalScoreGained += question.marks;
        } else {
          incorrectCount++;
        }

        // Detailed analysis for each question
        detailedBreakdown.push({
          questionText: question.questionText,
          options: question.options,
          yourAnswer: question.options[ans.selectedOption] || "Not Answered",
          correctAnswer: question.options[question.correctOption],
          status: isCorrect ? "CORRECT" : "WRONG",
          marksAwarded: isCorrect ? question.marks : 0
        });
      }
    }

    const totalQuestions = answers.length;
    const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(2) : 0;

    // Save this result to Database for history
    const testResult = new TestResult({
      studentId,
      subject,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      scoreGained: totalScoreGained,
      totalMarks: totalPossibleMarks,
      accuracy: `${accuracy}%`,
      attempts: answers.map(a => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect: detailedBreakdown.find(d => d.questionText === d.questionText).status === "CORRECT" // matching logic
      }))
    });

    await testResult.save();

    // RETURN THE FULL SCORECARD IMMEDIATELY
    res.status(200).json({
      success: true,
      message: "Test Completed Successfully!",
      scorecard: {
        testSummary: {
          subject: subject,
          totalQuestions: totalQuestions,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          totalMarksObtained: totalScoreGained,
          maxMarks: totalPossibleMarks,
          accuracyPercentage: `${accuracy}%`,
          performanceStatus: accuracy >= 70 ? "Excellent" : accuracy >= 40 ? "Good" : "Needs Improvement"
        },
        detailedReport: detailedBreakdown
      }
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
      .populate({
        path: 'studentId',
        select: 'profile.personalDetails.fullName profile.education'
      })
      .populate({
        path: 'attempts.questionId',
        select: 'questionText options'
      });

    if (!result) {
      return res.status(404).json({ message: "Scorecard not found!" });
    }

    // --- ACCURACY LOGIC ---
    // Agar DB mein "100.00%" (String) hai toh wahi dikhaye, 
    // agar Number hai toh format karein.
    let displayAccuracy = "0.00%";
    if (result.accuracy) {
      if (typeof result.accuracy === 'string') {
        displayAccuracy = result.accuracy; // "100.00%" as it is
      } else {
        displayAccuracy = `${result.accuracy.toFixed(2)}%`;
      }
    }

    // --- DETAILED ANALYSIS LOGIC ---
    let report = [];
    if (result.attempts && result.attempts.length > 0) {
      report = result.attempts.map(item => {
        const qText = item.questionId ? item.questionId.questionText : "Question Deleted";
        const opts = item.questionId ? item.questionId.options : [];
        
        return {
          question: qText,
          yourAnswer: opts[item.selectedOption] || "N/A",
          correctAnswer: opts[item.correctOption] || "N/A",
          status: item.isCorrect ? "CORRECT" : "WRONG"
        };
      });
    }

    res.status(200).json({
      success: true,
      studentName: result.studentId?.profile?.personalDetails?.fullName || "Student",
      studentClass: result.studentId?.profile?.education?.class,
      subject: result.subject,
      summary: {
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        scoreGained: result.scoreGained,
        totalMarks: result.totalMarks,
        accuracy: displayAccuracy, // Fix: Ab ye "100.00%" dikhayega
        status: parseFloat(displayAccuracy) >= 40 ? "Pass" : "Fail",
        date: result.submittedAt
      },
      detailedAnalysis: report 
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