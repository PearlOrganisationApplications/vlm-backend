require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// optional DB import
const connectDB = require("./config/db");
const adminRoutes = require("./routes/admin.routes");
const permissionRoutes = require("./routes/permission.routes");
const paymentRoutes = require("./routes/payment.routes");
const studentRoutes = require("./routes/student.routes"); 
const teacherRoutes = require("./routes/teacher.routes");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
connectDB();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


// routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/admins", adminRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/students", studentRoutes); // Add this line to include student routes
app.use("/api/teachers", teacherRoutes); // Add this line to include teacher routes

// global error handler (optional)
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});