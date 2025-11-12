const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust the path based on your setup

// LOOK UP FOR STUDENTS
router.get("/student_lookup", async (req, res) => {
  try {
    const students = await knex("students AS st")
      .select("st.id", "st.first_name", "st.last_name", "st.middle_name", "st.status")
      .where("st.status", "Active")

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
});

router.get("/quick_notes", async (req, res) => {
  const { studentId } = req.query;
  try {
    const item = await knex("case_records AS cr")
      .select("cr.user_id", "qn.id", "qn.name", "qn.case_record_id", "cr.date", "cr.case_type")
      .innerJoin("quick_notes AS qn", "qn.case_record_id", "cr.id")
      .innerJoin("students AS s", "s.id", "cr.student_id")
      .where("cr.student_id", studentId);

      // Group the quick note base on case record id
      const result = item.reduce((acc, item) => {
        if (!acc[item.case_record_id]) {
          acc[item.case_record_id] = [];
        }
        acc[item.case_record_id].push(item);
        return acc;
      }, {});

    res.json(result);
  } catch (error) {
    console.error("Error fetching quick notes:", error);
    res.status(500).json({ message: "Error fetching quick notes" });
  }
});

// LOOK UP FOR UPCOMING APPOINTMENTS WITH NAMES
router.get("/upcoming_appointments", async (req, res) => {
  const { userId } = req.query;
  try {
    const appointments = await knex("appointments AS apts")
      .select(
        "u.id AS user_id",
        "apts.id",
        "apts.datetime",
        "apts.mode",
        "apts.status",
        "s.first_name AS student_first_name",
        "s.middle_name AS student_middle_name",
        "s.last_name AS student_last_name"
      )
      .leftJoin("students AS s", "s.id", "apts.student_id")
      .leftJoin("counselors AS c", "c.id", "apts.counselor_id")
      .leftJoin("users AS u", "u.id", "c.user_id")
      .where("apts.status", "Pending")
      .andWhere("u.id", userId);
   
    const readableFormat = appointments.map((appt) => {
      const dt = new Date(appt.datetime); // convert ISO string to Date object
      return {
        ...appt,
        date: dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        time: dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      };
    });

    console.log(readableFormat, "readableFormat");

    res.json(readableFormat);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

// LOOK UP FOR CASE RECORDS
router.get("/case_updates", async (req, res) => {
  const { userId } = req.query;
  try {
    const caseRecords = await knex("case_records AS cr")
      .select(
        "u.id AS user_id",
        "cr.id",
        "cr.case_type",
        "cr.offense",
        "cr.session_type",
        "cr.student_id",
        "cr.remarks",
        "cr.date",
        "s.first_name",
        "s.middle_name",
        "s.last_name"
      )
      .leftJoin("students AS s", "s.id", "cr.student_id")
      .leftJoin("users AS u", "u.id", "cr.user_id")
      .where("u.id", userId);

      const formattedRes = caseRecords.map((cr) => {
        const dt = new Date(cr.date); // convert ISO string to Date object
        return {
          ...cr,
          date: dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
          time: dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
        };
      });

    console.log(formattedRes, "formattedRes");
    res.json(formattedRes);
  } catch (error) {
    console.error("Error fetching case records:", error);
    res.status(500).json({ message: "Error fetching case records" });
  }
});

router.get("/counselor_full_name", async (req, res) => {
  const { userId } = req.query;
  try {
    const counselorFullName = await knex("counselors AS c")
      .select("c.first_name", "c.middle_name", "c.last_name")
      .leftJoin("users AS u", "u.id", "c.user_id")
      .where("u.id", userId);
    res.json(counselorFullName);
  } catch (error) {
    console.error("Error fetching counselor full name:", error);
    res.status(500).json({ message: "Error fetching counselor full name" });
  }
});

module.exports = router;
