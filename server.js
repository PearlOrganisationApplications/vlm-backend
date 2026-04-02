require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// optional DB import
const connectDB = require("./config/db");
const adminRoutes = require("./routes/admin.routes");
const permissionRoutes = require("./routes/permission.routes");

const app = express();

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