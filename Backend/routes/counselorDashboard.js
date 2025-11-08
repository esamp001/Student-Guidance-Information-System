const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust the path based on your setup

// LOOK UP FOR STUDENTS
router.get("/student_lookup", async (req, res) => {
  const { userId } = req.query;
  try {
    const students = await knex("students")
      .select("id", "first_name", "last_name")
      .where("status", "Active")
      .andWhere("id", userId);

    console.log(students, "students");
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
});

// LOOK UP FOR UPCOMING APPOINTMENTS WITH NAMES
router.get("/upcoming_appointments", async (req, res) => {
  const { userId } = req.query;
  try {
    const appointments = await knex("appointments")
      .select(
        "appointments.id",
        "appointments.date",
        "appointments.time",
        "appointments.mode",
        "appointments.status",
        "s.first_name AS student_first_name",
        "s.last_name AS student_last_name",
        "c.first_name AS counselor_first_name",
        "c.last_name AS counselor_last_name"
      )
      .leftJoin("students AS s", "s.id", "appointments.student_id")
      .leftJoin("counselors AS c", "c.id", "appointments.counselor_id")
      .leftJoin("users AS u", "u.id", "c.user_id")
      .where("appointments.status", "Upcoming")
      .andWhere("u.id", userId)
      .orderBy("appointments.date", "asc")
      .orderBy("appointments.time", "asc");
    console.log(appointments, "appointments");
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});
// LOOK UP FOR CASE RECORDS
router.get("/case_records", async (req, res) => {
  try {
    const caseRecords = await knex("case_records")
      .select(
        "case_records.id",
        "case_records.student_id",
        "case_records.date",
        "case_records.time",
        "s.first_name AS student_first_name",
        "s.last_name AS student_last_name",
        "c.first_name AS counselor_first_name",
        "c.last_name AS counselor_last_name"
      )
      .leftJoin("students AS s", "s.id", "case_records.student_id")
      .leftJoin("counselors AS c", "c.id", "case_records.counselor_id");

    console.log(caseRecords, "caseRecords");
    res.json(caseRecords);
  } catch (error) {
    console.error("Error fetching case records:", error);
    res.status(500).json({ message: "Error fetching case records" });
  }
});

module.exports = router;
