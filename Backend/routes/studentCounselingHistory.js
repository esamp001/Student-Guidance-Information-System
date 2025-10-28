// routes/studentCounselingHistory.js

const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // <-- adjust path based on your project

router.get("/student/counseling_history", async (req, res) => {
  const { student_id } = req.query; // <-- we use query params (GET)

  if (!student_id) {
    return res
      .status(400)
      .json({ message: "Missing student_id query parameter." });
  }

  try {
    const result = await knex("appointments as apms")
      .select(
        "apms.datetime",
        "apms.type",
        "apms.reason",
        "apms.status",
        "cs.first_name",
        "cs.last_name"
      )
      .innerJoin("counselors as cs", "cs.id", "apms.counselor_id")
      .innerJoin("students as st", "st.id", "apms.student_id")
      .where("st.user_id", student_id)
      .orderBy("apms.datetime", "desc");

    const formattedResult = result.map((item) => ({
      ...item,
      datetime: new Date(item.datetime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));

    return res.json(formattedResult);
  } catch (error) {
    console.error("Counseling history error:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching counseling history." });
  }
});

module.exports = router;
