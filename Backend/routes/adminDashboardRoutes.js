const express = require("express");
const router = express.Router();
const knex = require("../db/db"); 


// API - Get Length of Students, Counselor and In Progress Guidance Records
router.get("/data", async (req, res) => {
    try {
        const students = await knex("students").count("id as c");
        const counselors = await knex("counselors").count("id as c");
        const inProgressGuidanceRecords = await knex("guidance_case_records")
            .where("remarks", "In Progress")
            .count("id as c");

        res.json({
            students: Number(students[0].c) || 0,
            counselors: Number(counselors[0].c) || 0,
            inProgressGuidanceRecords: Number(inProgressGuidanceRecords[0].c) || 0,
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports = router;