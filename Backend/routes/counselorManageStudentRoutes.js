const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust the path based on your setup
const bcrypt = require("bcryptjs");

// Look up student - Get
router.get("/counselor/student_lookup", async (req, res) => {
  try {
    const students = await knex("students as st")
      .select(
        "st.id",
        "st.first_name",
        "st.last_name",
        "st.status",
        "st.student_no",
        knex.raw("MAX(apts.datetime) AS last_appointment")
      )
      .leftJoin("appointments as apts", "st.id", "apts.student_id")
      .innerJoin("users as u", "u.id", "st.user_id")
      .where("u.role", "student")
      .groupBy(
        "st.id",
        "st.first_name",
        "st.last_name",
        "st.status",
        "st.student_no"
      );

    // Format last_appointment (e.g. May 30, 2024)
    const formattedStudents = students.map((st) => ({
      ...st,
      last_appointment: st.last_appointment
        ? new Date(st.last_appointment).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
          })
        : "No Appointment yet",
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Look up for counselor - Get
router.get("/academic_records/:id", async (req, res) => {
  const { id } = req.params;

  // Grade → Point mapping
  const gradeToPoint = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    D: 1.0,
    F: 0.0,
  };

  try {
    const records = await knex("academic_records")
      .select("course", "grade")
      .where("student_id", id);

    console.log(records, "all records");

    // Compute total grade points (average / GPA)
    let totalPoints = 0;
    let validCount = 0;

    records.forEach((rec) => {
      const point = gradeToPoint[rec.grade];
      if (point !== undefined) {
        totalPoints += point;
        validCount++;
      }
    });

    const gpa = validCount > 0 ? totalPoints / validCount : 0;

    // Send both records and computed total grade
    res.json({
      records,
      totalGrades: gpa.toFixed(2), // e.g. 3.45
    });
  } catch (error) {
    console.error("Error fetching academic records:", error);
    res.status(500).json({ message: "Error fetching academic records" });
  }
});

router.put("/students/status/bulk", async (req, res) => {
  const { studentNos, status } = req.body;

  if (!Array.isArray(studentNos) || !status) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    // Example using PostgreSQL with knex
    await knex("students").whereIn("student_no", studentNos).update({ status });

    return res.json({ message: "Students updated successfully" });
  } catch (error) {
    console.error("Error updating students:", error);
    return res.status(500).json({ message: "Failed to update students" });
  }
});

module.exports = router;
