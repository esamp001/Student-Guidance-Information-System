const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust the path based on your setup

// Add new case record - Post
router.post("/case-records/add", async (req, res) => {
  try {
    const {
      studentId,
      appointmentId,
      user_id,
      caseType,
      offense,
      sessionType,
      date,
      remarks,
      quickNotes, // array of note texts
    } = req.body;

    console.log(user_id, "userId");  

    // Insert Case Records First
    const newRecord = await knex("case_records")
      .insert({
        student_id: studentId,
        case_type: caseType,
        offense: offense,
        session_type: sessionType,
        date: date,
        remarks: remarks,
        user_id: user_id,
        appointment_id: appointmentId,
      })
      .returning("id");

    // Insert Quick Notes Second
    const newQuickNotes = await knex("quick_notes").insert(
      quickNotes.map((note) => ({
        name: note,
        case_record_id: newRecord[0].id,
      }))
    );

    res.json({
      message: "Case records added successfully",
      newRecord,
      newQuickNotes,
    });
  } catch (error) {
    console.error("Error adding case records:", error);
    res.status(500).json({ message: "Error adding case records" });
  }
});

router.get("/student_lookup", async (req, res) => {
  try {
    // Need only first name and last name
    const students = await knex("students")
      .select("id", "first_name", "last_name")
      .where("status", "Active");

    console.log(students, "students");

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
});

router.get("/AllCaseRecords", async (req, res) => {
  try {
    const caseRecordsRaw = await knex("case_records as rc")
      .select(
        "rc.id",
        "rc.offense",
        "rc.session_type",
        "rc.case_type",
        "rc.date",
        "rc.remarks",
        "st.first_name",
        "st.middle_name",
        "st.last_name"
      )
      .innerJoin("students as st", "st.id", "rc.student_id");

    // Map and format date
    const caseRecords = caseRecordsRaw.map((record) => ({
      ...record,
      date: new Date(record.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));

    const quickNotes = await knex("quick_notes").select(
      "id",
      "name",
      "case_record_id"
    );

    console.log(quickNotes, "quickNotes");

    res.json({ caseRecords, quickNotes });
  } catch (error) {
    console.error("Error fetching case records:", error);
    res.status(500).json({ message: "Error fetching case records" });
  }
});

// Lookup Appointments
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await knex("appointments").select("id", "type", "mode");
    console.log(appointments, "appointments");
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

module.exports = router;
