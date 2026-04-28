require("dotenv").config();
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
const doubtRoutes = require("./routes/doubtRoutes");


const rewardRoutes = require("./routes/rewardRoutes");

const interviewRoutes = require("./routes/interview.routes");
const rewardsRoutes = require("./routes/rewardRoutes")
const testRoutes = require("./routes/test.routes")


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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use("/api/spin",spinRoutes );
app.use("/api/admin/content", require("./routes/admin.content.routes"));
app.use("/api/student-mocktest", studentMocktestRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/interview",interviewRoutes );
app.use("/api/rewards", rewardRoutes);
app.use("/api/doubts", doubtRoutes);


app.use("/api/test", testRoutes)
// global error handler (optional)
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});


app.use("/api/chat", require("./routes/chatRoutes"));


socketConfig(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});