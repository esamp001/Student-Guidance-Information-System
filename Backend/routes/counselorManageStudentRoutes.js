const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust the path based on your setup
const bcrypt = require("bcryptjs");

// Look up student - Get
router.get("/counselor/student_lookup", async (req, res) => {
  try {
    const students = await knex("students as st")
      .select(
        "st.first_name",
        "st.last_name",
        "st.status",
        knex.raw("apts.datetime AS last_appointment")
      )
      .innerJoin("appointments as apts", "st.id", "apts.student_id");

    console.log(students, "students");

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
