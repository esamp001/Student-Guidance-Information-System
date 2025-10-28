const express = require("express");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const knex = require("./db/db"); // existing knex instance (adjust path if different)

const app = express();

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

app.use("/registerRoutes", registerRoutes);
app.use("/loginRoutes", loginRoutes);
app.use("/topNavBarRoutes", topNavBarRoutes);
app.use("/studentDashboardRoutes", studentDashboard);
app.use("/myProfileRoutes", studentMyProfile);
app.use("/adminAcademicRecordsRoutes", adminAcademicRecords);
app.use("/adminAddCounselor", adminAddCounselor);
app.use("/studentAppointmentSchedRoutes", studentAppointmentSchedule);
app.use("/studentCounselingHistory", studentCounselingHistory);

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
