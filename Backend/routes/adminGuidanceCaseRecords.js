const express = require("express");
const router = express.Router();
const knex = require("../db/db");

// Look up for students who initiated first and have a follow up session status
router.get("/admin/students/lookup", async (req, res) => {
  try {
    const results = await knex("appointments AS apts")
      .innerJoin("counselors AS c", "c.id", "apts.counselor_id")
      .innerJoin("students AS st", "st.id", "apts.student_id")
      .innerJoin("case_records AS cr", "cr.appointment_id", "apts.id")
      .select(
        "apts.id AS appointment_id",
        "c.id AS counselor_id",
        "st.id AS student_id",
        "cr.id AS case_record_id",
        "cr.case_type AS case_type",
        "c.first_name",
        "c.middle_name",
        "c.last_name",
        "st.first_name AS student_first_name",
        "st.middle_name AS student_middle_name",
        "st.last_name AS student_last_name",
        "st.student_no AS student_no",
        "cr.remarks",
        "apts.status"
      )
      .where("apts.status", "Follow-up");

    const caseRecords = results.map((result) => {
      return {
        ...result,
        case_status: "Open",
        createdAt: new Date().toISOString().slice(0, 10),
      };
    });

    res.json(caseRecords);
  } catch (error) {
    console.error("Error fetching follow-up students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// students/counselor/lookup - Get
router.get("/students/counselor/lookup", async (req, res) => {
  try {
    const students = await knex("students").select(
      "id",
      "first_name",
      "middle_name",
      "last_name",
      "student_no"
    );

    const counselors = await knex("counselors").select(
      "id AS counselor_id",
      "first_name AS counselor_first_name",
      "middle_name AS counselor_middle_name",
      "last_name AS counselor_last_name"
    );
    res.json({ students: students, counselors: counselors });
  } catch (err) {
    console.error(err);
    throw new err();
  }
});

// POST /guidanceCaseRecords
router.post("/guidanceCaseRecords", async (req, res) => {
  const {
    appointment_id,
    student_id,
    counselor_id,
    case_type,
    status,
    summary,
    remarks,
  } = req.body;

  // 1 Validate required fields
  if (!appointment_id || !student_id || !counselor_id || !case_type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 2 Check if a guidance case already exists for this appointment
    const existingCase = await knex("guidance_case_records")
      .where({ appointment_id })
      .first();

    if (existingCase) {
      return res.status(200).json({
        message: "Guidance case record already exists",
        case: existingCase,
      });
    }

    // 3  Insert the new guidance case record
    const [newCase] = await knex("guidance_case_records")
      .insert({
        appointment_id,
        student_id,
        counselor_id,
        case_type,
        status: status || "Open",
        summary: summary || "",
        remarks: remarks || "",
        created_at: new Date().toISOString(),
      })
      .returning("*");

    return res.status(201).json({
      message: "Guidance case record created successfully",
      case: newCase,
    });
  } catch (error) {
    console.error("Error creating guidance case record:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

// POST - When Counselor initated
router.post("/saveCase", async (req, res) => {
  const {
    appointment_id,
    student_id,
    counselor_id,
    case_type,
    status,
    summary,
    remarks,
  } = req.body;

  console.log(status, "status");

  try {
    const [newCaseId] = await knex("guidance_case_records")
      .insert({
        appointment_id,
        student_id,
        counselor_id,
        case_type,
        status: "No Appointment",
        summary: summary || "",
        remarks: remarks || "",
        created_at: new Date().toISOString(),
      })
      .returning("id");

    // Fetch the complete record with joined data (same as display_to_table)
    const [completeCase] = await knex("guidance_case_records AS cr")
      .select(
        "st.first_name",
        "st.middle_name",
        "st.last_name",
        "st.student_no",
        "cr.id",
        "cr.case_type",
        "cr.summary",
        "cr.remarks",
        "cr.created_at",
        "c.first_name AS counselor_first_name",
        "c.middle_name AS counselor_middle_name",
        "c.last_name AS counselor_last_name",
        "a.status AS appointment_status"
      )
      .innerJoin("students AS st", "st.id", "cr.student_id")
      .innerJoin("counselors AS c", "c.id", "cr.counselor_id")
      .leftJoin("appointments AS a", "a.id", "cr.appointment_id")
      .where("cr.id", newCaseId.id || newCaseId);

    // Format date to match display_to_table
    completeCase.created_at = new Date(
      completeCase.created_at
    ).toLocaleDateString();

    return res.status(201).json(completeCase);
  } catch (error) {
    console.error("Error creating guidance case record:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

// Get - When Counselor initated but check if the case is already been posted
router.get("/guidanceCaseRecords/display_to_table", async (req, res) => {
  try {
    const caseRecord = await knex("guidance_case_records AS cr")
      .select(
        "st.first_name",
        "st.middle_name",
        "st.last_name",
        "st.student_no",
        "cr.id",
        "cr.case_type",
        "cr.summary",
        "cr.remarks",
        "cr.created_at",
        "c.first_name AS counselor_first_name",
        "c.middle_name AS counselor_middle_name",
        "c.last_name AS counselor_last_name",
        "a.status AS appointment_status"
      )
      .innerJoin("students AS st", "st.id", "cr.student_id")
      .innerJoin("counselors AS c", "c.id", "cr.counselor_id")
      .leftJoin("appointments AS a", "a.id", "cr.appointment_id");

    // readable date
    caseRecord.forEach((record) => {
      record.created_at = new Date(record.created_at).toLocaleDateString();
    });

    if (caseRecord.length > 0) {
      return res.status(200).json(caseRecord);
    } else {
      return res.status(404).json({ message: "Case record not found" });
    }
  } catch (error) {
    console.error("Error fetching guidance case record:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

router.put("/guidanceCaseRecords/update/:id", async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  // basic validation
  if (!remarks) {
    return res.status(400).json({ message: "Remarks are required." });
  }

  try {
    const updated = await knex("guidance_case_records")
      .where({ id })
      .update({ remarks })
      .returning("*"); // optional, returns updated row(s) in PostgreSQL

    if (updated.length === 0) {
      return res.status(404).json({ message: "Case record not found." });
    }

    return res.status(200).json({
      message: "Remarks updated successfully.",
      updatedRecord: updated[0],
    });
  } catch (error) {
    console.error("Error updating case record:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

// GET - Fetch appointment progress/history for a student in a guidance case record
router.get(
  "/guidanceCaseRecords/:id/appointments-progress",
  async (req, res) => {
    const { id } = req.params;

    try {
      // Get the guidance case record to find the student_id
      const guidanceCase = await knex("guidance_case_records")
        .where({ id })
        .first();

      if (!guidanceCase) {
        return res
          .status(404)
          .json({ message: "Guidance case record not found" });
      }

      // Fetch all appointments for this student, ordered chronologically
      const appointments = await knex("appointments AS a")
        .select(
          "a.id AS appointment_id",
          "a.type",
          "a.mode",
          "a.datetime",
          "a.status",
          "a.reason",
          "a.created_at",
          knex.raw(`
          CONCAT(c.first_name, ' ', 
                 COALESCE(c.middle_name || ' ', ''), 
                 c.last_name) AS counselor_name
        `)
        )
        .leftJoin("counselors AS c", "c.id", "a.counselor_id")
        .where("a.student_id", guidanceCase.student_id)
        .orderBy("a.datetime", "asc");

      // Get associated case records (session notes) for each appointment
      const appointmentIds = appointments.map((a) => a.appointment_id);

      let caseRecordsData = [];
      let statusHistoryData = [];
      if (appointmentIds.length > 0) {
        caseRecordsData = await knex("case_records")
          .whereIn("appointment_id", appointmentIds)
          .select(
            "appointment_id",
            "case_type",
            "offense",
            "session_type",
            "date",
            "remarks"
          );

        // Fetch status change history for each appointment
        statusHistoryData = await knex("appointment_status_history")
          .whereIn("appointment_id", appointmentIds)
          .select(
            "appointment_id",
            "old_status",
            "new_status",
            "changed_by_role",
            "notes",
            "changed_at"
          )
          .orderBy("changed_at", "asc");
      }

      // Map case records and status history to appointments and format data
      const progressData = appointments.map((appt) => {
        const sessionNotes = caseRecordsData.find(
          (cr) => cr.appointment_id === appt.appointment_id
        );

        // Get all status changes for this appointment
        const statusHistory = statusHistoryData
          .filter((sh) => sh.appointment_id === appt.appointment_id)
          .map((sh) => ({
            old_status: sh.old_status,
            new_status: sh.new_status,
            changed_by_role: sh.changed_by_role,
            notes: sh.notes,
            changed_at: new Date(sh.changed_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));

        return {
          appointment_id: appt.appointment_id,
          type: appt.type,
          mode: appt.mode,
          status: appt.status,
          datetime: appt.datetime,
          datetime_formatted: new Date(appt.datetime).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          reason: appt.reason,
          counselor_name: appt.counselor_name,
          session_notes: sessionNotes || null,
          status_history: statusHistory,
          created_at: appt.created_at,
        };
      });

      return res.status(200).json({
        student_id: guidanceCase.student_id,
        total_appointments: progressData.length,
        appointments: progressData,
      });
    } catch (error) {
      console.error("Error fetching appointments progress:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  }
);

// Get students from counselor's case records who don't have appointments yet
router.get(
  "/counselor/:counselorUserId/students-without-appointments",
  async (req, res) => {
    const { counselorUserId } = req.params;

    try {
      // First, get the counselor ID from the user ID
      const counselor = await knex("counselors")
        .where("user_id", counselorUserId)
        .first();

      if (!counselor) {
        return res.status(404).json({ message: "Counselor not found" });
      }

      console.log("Counselor ID:", counselor.id);

      // Get all students assigned to this counselor through guidance case records
      const allStudents = await knex("guidance_case_records AS gcr")
        .select(
          "gcr.id AS case_id",
          "gcr.appointment_id",
          "gcr.student_id",
          "gcr.case_type",
          "gcr.summary",
          "s.student_no",
          "s.first_name",
          "s.middle_name",
          "s.last_name"
        )
        .leftJoin("students AS s", "s.id", "gcr.student_id")
        .where("gcr.counselor_id", counselor.id)
        .orderBy("gcr.created_at", "desc");

      console.log(allStudents, "allStudents");

      // Filter out students who have active appointments

      // get all students from all students with a null appointment_id from counseling case record
      const studentsWithNull = allStudents.filter(
        (student) =>
          student.appointment_id === null || student.status === "No Appointment"
      );

      console.log(studentsWithNull, "studentsWithNull");

      return res.status(200).json(studentsWithNull);
    } catch (error) {
      console.error("Error fetching students without appointments:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  }
);

// Counselor-initiated appointment request
router.post("/counselor-initiate-appointment", async (req, res) => {
  const {
    student_id,
    counselor_user_id,
    case_id, // the related guidance case record
    type,
    mode,
    datetime,
    reason,
    status,
  } = req.body;

  try {
    // 1. Get counselor ID
    const counselor = await knex("counselors")
      .where("user_id", counselor_user_id)
      .first();

    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    // 2. Insert appointment
    const [appointment] = await knex("appointments")
      .insert({
        student_id,
        counselor_id: counselor.id,
        type,
        mode,
        datetime,
        reason,
        status: status || "Pending Confirmation",
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("id");

    const appointmentId = appointment.id; // integer ID

    // 3. Insert initial status history
    await knex("appointment_status_history").insert({
      appointment_id: appointmentId,
      old_status: null,
      new_status: "Pending Confirmation",
      changed_by: counselor.id,
      changed_by_role: "counselor",
      notes: "Counselor-initiated appointment request",
      changed_at: new Date(),
    });

    // 4. Update guidance case record to link the new appointment
    if (case_id) {
      await knex("guidance_case_records").where("id", case_id).update({
        appointment_id: appointmentId,
        updated_at: new Date(),
      });
    }

    return res.status(201).json({
      message: "Appointment request created successfully",
      appointment_id: appointmentId,
    });
  } catch (error) {
    console.error("Error creating counselor-initiated appointment:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
