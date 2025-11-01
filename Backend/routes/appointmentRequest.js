const express = require("express");
const router = express.Router();
const knex = require("../db/db");

router.get("/counselor/appointments_lookup", async (req, res) => {
  const { counselorUserId } = req.query;

  try {
    // Base query
    let query = knex("appointments AS aps")
      .select(
        "aps.id AS appointment_id",
        "aps.type",
        "aps.mode",
        "aps.datetime",
        "aps.status",
        "c.id AS counselor_id",
        "c.first_name AS counselor_first_name",
        "c.middle_name AS counselor_middle_name",
        "c.last_name AS counselor_last_name",
        "c.specialization",
        "s.id AS student_id",
        "s.first_name AS student_first_name",
        "s.last_name AS student_last_name",
        "s.student_no"
      )
      .innerJoin("counselors AS c", "c.id", "aps.counselor_id")
      .innerJoin("users AS u", "u.id", "c.user_id")
      .innerJoin("students AS s", "s.id", "aps.student_id")
      .where("u.id", counselorUserId);

    // Order by datetime
    const appointments = await query.orderBy("aps.datetime", "desc");

    console.log(appointments, "appointments");
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

module.exports = router;
