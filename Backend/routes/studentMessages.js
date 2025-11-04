const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust path

// GET completed appointments for students by user ID
router.get("/conversationList/completed", async (req, res) => {
  const { userId } = req.query;
  console.log(userId);

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const students = await knex("students as st")
      .distinct("st.id", "st.first_name", "st.middle_name", "st.last_name")
      .innerJoin("users as u", "u.id", "st.user_id")
      .innerJoin("appointments as apt", "apt.student_id", "st.id")
      .where("u.id", userId)
      .andWhere("apt.status", "Completed");

    console.log(students, "students");
    res.json(students);
  } catch (error) {
    console.error("Error fetching completed appointments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
