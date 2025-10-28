const express = require("express");
const router = express.Router();
const knex = require("../db/db");

router.get("/admin/all_students/lookup", async (req, res) => {
  try {
    const search = req.query.search || ""; // frontend sends ?search=John

    const data = await knex("students as st")
      .select(
        "st.id",
        "st.first_name",
        "st.middle_name",
        "st.last_name",
        "st.student_no",
        "st.course"
      )
      .where(function () {
        this.whereRaw(
          "concat_ws(' ', st.first_name, st.middle_name, st.last_name) ILIKE ?",
          [`%${search}%`]
        ).orWhere("st.student_no", "ILIKE", `%${search}%`);
      })
      .orderBy("st.last_name", "asc");

    const formatted = data.map((st) => ({
      id: st.id,
      full_name: `${st.first_name} ${st.middle_name || ""} ${
        st.last_name
      }`.trim(),
      student_no: st.student_no,
      course: st.course,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching all students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/admin/save/academic_record", async (req, res) => {
  const { student_id, overall_note, records } = req.body;

  // Basic validation
  if (
    !student_id ||
    !records ||
    !Array.isArray(records) ||
    records.length === 0
  ) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  const trx = await knex.transaction();

  try {
    // Delete old records for this student
    await trx("academic_records").where({ student_id }).del();

    // Prepare new records
    const newRecords = records.map((r) => ({
      student_id,
      course: r.course,
      grade: r.grade,
      overall_note,
    }));

    // Insert new records
    await trx("academic_records").insert(newRecords);

    // Commit transaction
    await trx.commit();

    res.json({ message: "Academic records replaced successfully" });
  } catch (error) {
    await trx.rollback();
    console.error("Error saving academic records:", error);
    res.status(500).json({ error: "Failed to save academic records" });
  }
});

router.get("/admin/get/academic_record/:student_id", async (req, res) => {
  try {
    const { student_id } = req.params;

    // Get student’s records
    const records = await knex("academic_records")
      .select("id", "student_id", "course", "grade", "overall_note")
      .where("student_id", student_id);

    res.json({
      records,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch academic records" });
  }
});

module.exports = router;
