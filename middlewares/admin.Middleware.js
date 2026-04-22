const adminCheck = (req, res, next) => {
  // Aapke authMiddleware ne req.role mein "ADMIN" ya "USER" set kiya hua hai
  if (req.role === "ADMIN") {
    next(); // Agar Admin hai toh aage badhne do
  } else {
    return res.status(403).json({ 
      success: false,
      message: "Access Denied: Sirf Admin hi reward values badal sakta hai!" 
    });
  }
};

module.exports = adminCheck;