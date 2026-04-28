require("dotenv").config();
const dns = require("node:dns/promises");
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const socketConfig = require("./socket/index");
// optional DB import
const connectDB = require("./config/db");
const adminRoutes = require("./routes/admin.routes");
const permissionRoutes = require("./routes/permission.routes");
const paymentRoutes = require("./routes/payment.routes");
const studentRoutes = require("./routes/student.routes");
const teacherRoutes = require("./routes/teacher.routes");
const spinRoutes = require("./routes/spin.routes");
const studentMocktestRoutes = require("./routes/student.mocktest.routes");
const parentRoutes = require("./routes/parent.routes");
const interviewRoutes = require("./routes/interview.routes");
const walletRoutes = require("./routes/wallet.routes");
const doubtRoutes = require("./routes/doubtRoutes");
const rewardsRoutes = require("./routes/rewardRoutes");
const testRoutes = require("./routes/test.routes");
const errorHandler = require("./middlewares/errorHandler.middleware");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});



app.use("/uploads", express.static(path.join(__dirname, "uploads")));
connectDB();

// middlewares
app.use(cors());

// Global JSON parser with raw body capture for webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    // Capture raw body for any route containing /webhook
    if (req.originalUrl && req.originalUrl.toLowerCase().includes('webhook')) {
      req.rawBody = buf.toString('utf8');
      console.log(`[Parser] Raw body captured for ${req.originalUrl} (${buf.length} bytes)`);
    }
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/wallet", walletRoutes);
// routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/admins", adminRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/students", studentRoutes); // Add this line to include student routes
app.use("/api/teachers", teacherRoutes); // Add this line to include teacher routes
app.use("/api/spin", spinRoutes);
app.use("/api/admin/content", require("./routes/admin.content.routes"));
app.use("/api/student-mocktest", studentMocktestRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/reels", require("./routes/reel.routes"));
app.use("/api/videos", require("./routes/video.routes"));
app.use("/api/rewards", rewardsRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/test", testRoutes);

app.use("/api/chat", require("./routes/chatRoutes"));

// global error handler
app.use(errorHandler);

socketConfig(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});