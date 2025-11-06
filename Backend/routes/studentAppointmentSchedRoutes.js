const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust the path based on your setup
const bcrypt = require("bcryptjs");

// Look up counselor - Get
router.get("/student/counselor_lookup", async (req, res) => {
  try {
    const counselors = await knex("counselors as cl").select(
      "cl.id",
      "cl.user_id as counselor_user_id",
      "cl.first_name",
      "cl.middle_name",
      "cl.last_name",
      "cl.specialization"
    );

    res.json(counselors);
  } catch (error) {
    console.error("Error fetching counselors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Request appointment - Post
router.post("/student/request_appointment", async (req, res) => {
  const { type, student_id, counselor_id, mode, datetime, reason } = req.body;

  const parsedDate = new Date(datetime);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: "Invalid datetime format." });
  }

  // Validate IDs
  if (isNaN(student_id) || isNaN(counselor_id)) {
    return res.status(400).json({
      error: "Student ID and Counselor ID must be valid numbers.",
    });
  }

  const now = new Date();
  if (parsedDate < now) {
    return res
      .status(400)
      .json({ error: "Cannot schedule an appointment in the past." });
  }

  try {
    // Make sure the student exists
    const student = await knex("students").where("user_id", student_id).first();
    if (!student) {
      return res.status(400).json({ error: "Student does not exist." });
    }

    const result = await knex("appointments").insert({
      type,
      student_id: student.id, // use the real students.id
      counselor_id,
      mode,
      datetime,
      reason: reason || "",
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/student/appointment/lookup", async (req, res) => {
  try {
    const studentUserId = req.session.user?.id; // logged-in student

    if (!studentUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get student.id
    const student = await knex("students")
      .where("user_id", studentUserId)
      .first();
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Fetch upcoming appointments
    const appointments = await knex("appointments as ar")
      .select(
        "ar.id",
        "ar.type",
        "ar.datetime",
        "ar.status",
        "c.first_name as counselor_first_name",
        "c.last_name as counselor_last_name",
        "u_c.id as counselor_user_id"
      )
      .innerJoin("counselors as c", "c.id", "ar.counselor_id")
      .innerJoin("users as u_c", "u_c.id", "c.user_id")
      .where("ar.student_id", student.id);

    const mappedAppointments = appointments.map((appt) => ({
      id: appt.id,
      type: appt.type,
      datetime: appt.datetime,
      status: appt.status,
      counselor_user_id: appt.counselor_user_id,
      counselorName: `${appt.counselor_first_name} ${appt.counselor_last_name}`,
    }));

    res.json(mappedAppointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch upcoming appointments" });
  }
});

module.exports = router;
