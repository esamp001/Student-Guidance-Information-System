const express = require("express");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const knex = require("./db/db"); // existing knex instance (adjust path if different)
// Server Start
const http = require("http");
const { Server } = require("socket.io");

const app = express();
// Create HTTP server using Express app
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true, // allow cookies to be sent
  })
);
app.use(express.json());

// Setup session store with Knex
const store = new KnexSessionStore({
  knex,
  tablename: "sessions", // name for your session table
  createtable: true, // auto create if not exists
  sidfieldname: "sid",
  clearInterval: 1000 * 60 * 60, // clear expired sessions hourly
});

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key", // use .env in production
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true, // can't access via JS
      secure: false, // true if using HTTPS
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

// Routes
const registerRoutes = require("./routes/registerRoutes");
const loginRoutes = require("./routes/loginRoutes");
const topNavBarRoutes = require("./routes/topNavBarRoutes");
const studentDashboard = require("./routes/studentDashboardRoutes");
const studentMyProfile = require("./routes/myProfileRoutes");
const adminAcademicRecords = require("./routes/adminAcademicRecordsRoutes");
const adminAddCounselor = require("./routes/adminAddCounselor");
const studentAppointmentSchedule = require("./routes/studentAppointmentSchedRoutes");
const studentCounselingHistory = require("./routes/studentCounselingHistory");
const counselorManageStudent = require("./routes/counselorManageStudentRoutes");
const counselorAppointmentRequest = require("./routes/appointmentRequest");
const studentAppointmentReschedule = require("./routes/studentAppointmentReschedule");
const studentMessages = require("./routes/studentMessages");

app.use("/registerRoutes", registerRoutes);
app.use("/loginRoutes", loginRoutes);
app.use("/topNavBarRoutes", topNavBarRoutes);
app.use("/studentDashboardRoutes", studentDashboard);
app.use("/myProfileRoutes", studentMyProfile);
app.use("/adminAcademicRecordsRoutes", adminAcademicRecords);
app.use("/adminAddCounselor", adminAddCounselor);
app.use("/studentAppointmentSchedRoutes", studentAppointmentSchedule);
app.use("/studentCounselingHistory", studentCounselingHistory);
app.use("/counselorManageStudentRoutes", counselorManageStudent);
app.use("/appointmentRequest", counselorAppointmentRequest);
app.use("/studentAppointmentReschedule", studentAppointmentReschedule);
app.use("/studentMessages", studentMessages);

// Create a new Socket.IO server instance
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your React frontend
    credentials: true,
  },
});

// Map to track connected users
const users = {}; // userId → socketId

// Handle socket connections
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // When a user registers their ID after connecting
  socket.on("register_user", (userId) => {
    users[userId] = socket.id;
    console.log(`📘 User registered: ${userId} -> ${socket.id}`);
  });

  // When a message is sent
  socket.on("send_message", (data) => {
    const { receiverId, content, author, time } = data;
    const targetSocket = users[receiverId]; // find receiver's socket

    console.log(` Message from ${author} to ${receiverId}: ${content}`);

    if (targetSocket) {
      // Send message to receiver
      io.to(targetSocket).emit("receive_message", {
        author,
        content,
        time,
      });
    }

    // Also send it back to the sender for confirmation
    io.to(socket.id).emit("receive_message", {
      author,
      content,
      time,
    });

    // (Optional) Save to DB
    // await knex("messages").insert({ sender_id: author, receiver_id: receiverId, content });
  });

  // When user disconnects
  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
    // Remove user from map if they were registered
    for (const [userId, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[userId];
        console.log(` Removed user ${userId} from active sockets`);
        break;
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
