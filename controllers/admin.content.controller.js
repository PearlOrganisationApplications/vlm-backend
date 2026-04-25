const Subject = require("../models/Subject");
const StudyMaterial = require("../models/StudyMaterial");
const Student = require("../models/Student");
const MockTest = require("../models/MockTest");



exports.createSubject = async (req, res) => {
  try {
    const { name, className, board, thumbnail } = req.body;

    const newSubject = await Subject.create({
      name,
      className,
      board,
      thumbnail
    });

    res.status(201).json({
      success: true,
      message: "Subject Created Successfully",
      data: newSubject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while creating the Subject",
      error: error.message
    });
  }
};


exports.uploadMaterial = async (req, res) => {
  try {
    const { subjectId, title, description, contentType, chapterName, chapterNumber, accessPlan } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Please slect the file (PDF or Video)" 
      });
    }

 const validTypes = [
      "PDF", "VIDEO", "PYQ", "QUESTION_BANK", "TEXTBOOK", 
      "SAMPLE_PAPER", "WORKSHEET", "REVISION_NOTES", "FORMULA_SHEET", "MOCK_TEST"
      , "CHAPTER_SUMMARY", "ASSIGNMENTS", "IMPORTANT_QUESTIONS"
    ];

    if (!validTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid contentType. Allowed types: ${validTypes.join(", ")}`
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject nahi mila, pehle subject create karein" 
      });
    }



    const protocol = req.protocol; 
  
    const host = req.get("host"); 
    const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const newMaterialData = {
      subjectId: subjectId,
      title: title,
      description: description,
      contentType: contentType, 
      chapterName: chapterName,
      chapterNumber: chapterNumber,
      className: subject.className, 
      board: subject.board,
      accessPlan : accessPlan  || "BASIC"          
    };

    if (contentType === "VIDEO") {
      newMaterialData.videoUrl = fullUrl;
    } else {
      newMaterialData.fileUrl = fullUrl;
    }

    const material = await StudyMaterial.create(newMaterialData);

    res.status(201).json({
      success: true,
      message: `${contentType} successfully upload ho gaya`,
      data: material
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Server par upload karne mein error aaya",
      error: error.message
    });
  }
};

exports.getAllSubjects = async (req, res) => {
  try {
    // Database se saare subjects fetch karna
    const subjects = await Subject.find();

    // Response bhejna
    res.status(200).json({
      success: true,
      message: "All Subjects fetched successfully",
      count: subjects.length, // Total kitne subjects mile
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while fetching subjects",
      error: error.message
    });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const { type } = req.query;

    let filter = {};

    if (type) {
      const validTypes = [
        "PDF", "VIDEO", "PYQ", "QUESTION_BANK", "TEXTBOOK", 
        "SAMPLE_PAPER", "WORKSHEET", "REVISION_NOTES", "FORMULA_SHEET", 
        "MOCK_TEST", "CHAPTER_SUMMARY", "ASSIGNMENTS", "IMPORTANT_QUESTIONS"
      ];

      if (validTypes.includes(type.toUpperCase())) {
        filter.contentType = type.toUpperCase();
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid content type query"
        });
      }
    }

    // Database se data nikalna (Subject details ke saath)
    const materials = await StudyMaterial.find(filter).populate("subjectId");

    res.status(200).json({
      success: true,
      message: type ? `${type} materials fetched` : "All materials fetched",
      results: materials.length,
      data: materials
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Data fetch karne mein error aaya",
      error: error.message
    });
  }
};


exports.createMockTest = async (req, res) => {
  try {
    const { subjectId, title, duration, questions, chapterName } = req.body;

    // Subject se class aur board khud nikalna
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const mockTest = await MockTest.create({
      subjectId,
      title,
      duration,
      questions, 
      chapterName,
      className: subject.className,
      board: subject.board,
      totalMarks: questions.length // Maan lete hain 1 question = 1 mark
    });

    res.status(201).json({ success: true, message: "Mock Test Created", data: mockTest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



