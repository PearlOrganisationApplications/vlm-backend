// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    // 🔥 strict separation
    if (decoded.type === "ADMIN") {
      user = await Admin.findById(decoded.id).populate({
        path: "role",
        populate: { path: "permissions" },
      });
    } else if (decoded.type === "USER") {
      user = await User.findById(decoded.id);
    } else {
      return res.status(401).json({ message: "Invalid token type" });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.role = decoded.type;

    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;