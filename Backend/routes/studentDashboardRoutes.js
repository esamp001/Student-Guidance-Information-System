const express = require("express");
const router = express.Router();
const knex = require("../db/db");

// GET - STUDENT DASHBOARD
router.get("/student/data/lookup", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    const data = await knex("students as st")
      .select("st.first_name", "st.middle_name", "st.last_name")
      .innerJoin("users as us", "us.id", "st.user_id")
      .where("us.id", userId);

    const student = data[0] || null;

    // Add current date in "Friday, July 14th" format
    const today = new Date();
    const day = today.getDate();

    // Helper for ordinal suffix
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
    }).format(today);

    const dateWithOrdinal = `${formattedDate} ${day}${getOrdinal(day)}`;

    res.json({ ...student, currentDate: dateWithOrdinal });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET - COUNSELING HISTORY DASHBOARD
router.get("/counseling/history/lookup", async (req, res) => {
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

    const formattedResult = result.map((item) => {
      const dateObj = new Date(item.datetime);

      return {
        ...item,
        date: dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Manila",
        }),
        time: dateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Manila",
        }),
      };
    });

    return res.json(formattedResult);
  } catch (error) {
    console.error("Counseling history error:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching counseling history." });
  }
});

module.exports = router;
