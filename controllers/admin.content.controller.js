const Subject = require("../models/Subject");
const StudyMaterial = require("../models/StudyMaterial");

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
      message: "Subject create karne mein error aaya",
      error: error.message
    });
  }
};


exports.uploadMaterial = async (req, res) => {
  try {
    const { subjectId, title, description, contentType } = req.body;

    // 1. Pehle check karein ki file aayi hai ya nahi
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Kripya file select karein (PDF ya Video)" 
      });
    }

 const validTypes = [
      "PDF", "VIDEO", "PYQ", "QUESTION_BANK", "TEXTBOOK", 
      "SAMPLE_PAPER", "WORKSHEET", "REVISION_NOTES", "FORMULA_SHEET", 
      "MOCK_TEST", "CHAPTER_SUMMARY", "ASSIGNMENTS", "IMPORTANT_QUESTIONS"
    ];

    if (!validTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid contentType. Allowed types: ${validTypes.join(", ")}`
      });
    }

    // 2. Subject ki details nikaalein (Class aur Board automatic lene ke liye)
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ 
        success: false, 
        message: "Subject nahi mila, pehle subject create karein" 
      });
    }



    const protocol = req.protocol; 
    // Isse localhost:5000 ya aapka domain name milega
    const host = req.get("host"); 
    // Pura URL taiyar karein
    const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    // 4. Data object taiyar karein
    const newMaterialData = {
      subjectId: subjectId,
      title: title,
      description: description,
      contentType: contentType, 
      className: subject.className, 
      board: subject.board           
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