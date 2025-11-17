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
        "st.course",
        "st.student_no",
        "st.contact_no",
        "st.behavior_record"
      )
      .leftJoin("users as us", "us.id", "st.user_id") // join users
      .where("us.role", "student")
      .andWhere(function () {
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
      contact_no: st.contact_no,
      behavior_record: st.behavior_record,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching all students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/admin/allowed_student_ids", async (req, res) => {
  try {
    const data = await knex("allowed_student_ids").select("id", "student_id");
    res.json(data);
  } catch (error) {
    console.error("Error fetching allowed student IDs:", error);
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

router.post("/admin/allowed_student_ids", async (req, res) => {
  const { student_id } = req.body;

  try {
    await knex("allowed_student_ids").insert({ student_id });
    res.json({ message: "Student ID added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add student ID" });
  }
});

router.put("/admin/toggle_student/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const student = await knex("students").where({ id }).first();

    const newStatus = student.status === "Active" ? "Inactive" : "Active";

    await knex("students").where({ id }).update({ status: newStatus });

    res.json({ message: "Status updated", status: newStatus });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.delete("/admin/allowed_student_ids/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await knex("allowed_student_ids").where({ id }).del();
    res.json({ message: "Student ID deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete student ID" });
  }
});

module.exports = router;
