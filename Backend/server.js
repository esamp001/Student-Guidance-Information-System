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
const counselorMessages = require("./routes/counselorMessages");
const createNotification = require("./routes/notificationRoutes");
const caseRecordsCounselor = require("./routes/caseRecordsCounselor");
const counselorDashboard = require("./routes/counselorDashboard");
const adminGuidanceCaseRecords = require("./routes/adminGuidanceCaseRecords");

// Create a new Socket.IO server instance
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your React frontend
    credentials: true,
  },
});

// Middleware to make socket available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
app.use("/counselorMessages", counselorMessages);
app.use("/createNotification", createNotification);
app.use("/caseRecordsCounselor", caseRecordsCounselor);
app.use("/counselorDashboard", counselorDashboard);
app.use("/adminGuidanceCaseRecords", adminGuidanceCaseRecords);
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("register_user", (userId) => {
    const room = `user_${String(userId)}`;
    console.log(`User ${userId} (type: ${typeof userId}) joined room ${room}`);
    socket.join(room);
  });

  socket.on("send_message", async (data) => {
    const { receiverId, content, author, time, appointmentId } = data;
    console.log(
      {
        receiverId,
        content,
        author,
        time,
        appointmentId,
        types: { receiverId: typeof receiverId, author: typeof author },
      },
      "message data"
    );

    // ONLY push to receiver (sender appends locally)
    io.to(`user_${String(receiverId)}`).emit("receive_message", {
      author, // real sender ID
      content,
      time,
      appointmentId,
    });

    // Save to DB
    try {
      await knex("messages").insert({
        appointment_id: appointmentId,
        sender_id: author,
        receiver_id: receiverId,
        content,
        created_at: new Date(),
        is_read: false,
      });

      // Recompute unread counts for the receiver and emit
      const total = await knex("messages")
        .count("id as c").where({ receiver_id: receiverId, is_read: false }).first();

      const conv = await knex("messages")
        .count("id as c")
        .where({ receiver_id: receiverId, appointment_id: appointmentId, is_read: false })
        .first();

      io.to(`user_${String(receiverId)}`).emit("unread_update", {
        total: Number(total?.c) || 0,
        appointmentId,
        count: Number(conv?.c) || 0,
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
