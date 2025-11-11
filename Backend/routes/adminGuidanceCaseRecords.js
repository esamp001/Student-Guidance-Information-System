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
router.get("/students/counselor/lookup", async (req,res) => {

    try {
        const students = await knex("students")
        .select("id", "first_name", "middle_name", "last_name", "student_no")

        const counselors = await knex("counselors")
        .select("id AS counselor_id", "first_name AS counselor_first_name", "middle_name AS counselor_middle_name", "last_name AS counselor_last_name")
        res.json({students: students, counselors: counselors})
    } catch (err) {
        console.error(err)
        throw new err
    }
})

// POST /guidanceCaseRecords
router.post("/guidanceCaseRecords", async (req, res) => {
    const {
        appointment_id,
        student_id,
        counselor_id,
        case_type,
        status,
        summary,
        remarks
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
                case: existingCase
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
                created_at: new Date().toISOString()
            })
            .returning("*");

        return res.status(201).json({
            message: "Guidance case record created successfully",
            case: newCase
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
        remarks
    } = req.body;

    try {
        const [newCase] = await knex("guidance_case_records")
            .insert({
                appointment_id,
                student_id,
                counselor_id,
                case_type,
                status: status || "Open",
                summary: summary || "",
                remarks: remarks || "",
                created_at: new Date().toISOString()
            })
            .returning("*");

        return res.status(201).json({
            message: "Guidance case record created successfully",
            case: newCase
        });
    } catch (error) {
        console.error("Error creating guidance case record:", error);
        return res.status(500).json({ message: "Server error", error });
    }
})

// Get - When Counselor initated but check if the case is already been posted
router.get("/guidanceCaseRecords/display_to_table", async (req, res) => {
    try {
        const caseRecord = await knex("guidance_case_records")
            // querying the guidance_case_records table
            // .select("*")
 
        console.log(caseRecord, "caseRecord")
        if (caseRecord) {
            return res.status(200).json(caseRecord);
        } else {
            return res.status(404).json({ message: "Case record not found" });
        }
    } catch (error) {
        console.error("Error fetching guidance case record:", error);
        return res.status(500).json({ message: "Server error", error });
    }
})


// 
module.exports = router;