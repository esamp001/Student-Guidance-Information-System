const express = require("express");
const router = express.Router();
const knex = require("../db/db");
const ExcelJS = require('exceljs');

router.get('/admin/lookup-data', async (req, res) => {
    const { GenerateReport } = req.query;

    try {
        const StudentGroup = await knex('students').select('id', 'first_name', 'middle_name', 'last_name');
        const Counselor = await knex('counselors').select('id', 'first_name', 'middle_name', 'last_name');

        res.status(200).json({ GenerateReport, StudentGroup, Counselor });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }

});

module.exports = router;