const express = require("express");
const router = express.Router();
const knex = require("../db/db");

// GET
router.get("/basic_information/data/lookup", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    // Fetch basic student info
    const studentData = await knex("students as st")
      .select(
        "st.first_name",
        "st.middle_name",
        "st.last_name",
        "st.student_no",
        "st.contact_no",
        "st.course"
      )
      .innerJoin("users as us", "us.id", "st.user_id")
      .where("us.id", userId)
      .first(); // use .first() instead of [0]

    // Fetch academic records
    const academicRecords = await knex("academic_records as ar")
      .select("ar.course", "ar.grade", "ar.overall_note")
      .innerJoin("students as st", "ar.student_id", "st.id")
      .innerJoin("users as u", "u.id", "st.user_id")
      .where("u.id", userId);

    // Combine results
    const response = {
      studentInfo: studentData || null,
      academicRecords: academicRecords || [],
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/basic_information/update", async (req, res) => {
  try {
    const {
      userId,
      first_name,
      middle_name,
      last_name,
      course,
      contact_no,
      student_no,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    // Update record in DB
    await knex("students").where({ user_id: userId }).update({
      first_name,
      middle_name,
      last_name,
      contact_no,
      student_no,
      course,
    });

    // Fetch updated info
    const updatedStudent = await knex("students as st")
      .join("users as u", "st.user_id", "u.id")
      .select(
        "st.first_name",
        "st.middle_name",
        "st.last_name",
        "st.contact_no",
        "st.student_no",
        "st.course"
      )
      .where("st.user_id", userId)
      .first();

    res.json(updatedStudent);
  } catch (error) {
    console.error("Error updating basic information:", error);
    res.status(500).json({ error: "Failed to update basic information" });
  }
});

module.exports = router;
