const express = require("express");
const router = express.Router();
const knex = require("../db/db");
const ExcelJS = require('exceljs');

// Look up data on generate report
router.get('/lookup-data', async (req, res) => {
    const { GenerateReport } = req.query;

    try {
        const StudentGroup = await knex('students').select('id', 'first_name', 'middle_name', 'last_name');
    
        res.status(200).json({ GenerateReport, StudentGroup });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }

});

// Generate Excel Report
router.post('/generate-excel', async (req, res) => {
  try {
    const { reportType, studentGroup, counselor, startDate, endDate, userId } = req.body;
    
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    
    // Set up the report based on type
    let data = [];
    let headers = [];
    let title = '';
    
    switch (reportType) {
      case 'Academic Performance':
        title = 'Academic Performance Report';
        data = await getAcademicPerformanceData(studentGroup, counselor, startDate, endDate, userId);
        headers = ['Student ID', 'Student Name', 'Course & Year level', 'Status', 'Grade', 'Overall Note'];
        break;
        
      case 'Appointment Report':   
        title = 'Appointment Report';
        data = await appointmentReport(studentGroup, counselor, startDate, endDate, userId);
        headers = ['Session ID', 'Appointment Type', 'Session Type', 'Student Name', 'Session Date', 'Status', 'Notes'];
        break;
        
      case 'Case Records':
        title = 'Case Records';
        data = await caseRecords(studentGroup, counselor, startDate, endDate, userId);
        headers = ['Case ID', 'Student Name', 'Case Offense', 'Session Type', 'Status', 'Case Date', 'Remarks'];
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }
    
    // Style the worksheet
    setupWorksheetStyles(worksheet, title, headers, data);
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Set response headers
    const filename = `${reportType.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the buffer
    res.send(buffer);
    
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ error: 'Failed to generate Excel report' });
  }
});

// Helper function to get academic performance data
async function getAcademicPerformanceData(studentGroup, startDate, endDate) {
  let query = knex('students as s')
    .leftJoin('academic_records as ar', 's.id', 'ar.student_id')
    .select(
      's.id',
      knex.raw("CONCAT(s.first_name, ' ', s.middle_name, ' ', s.last_name) as student_name"),
      's.course',
      's.status',
      'ar.grade',
      'ar.overall_note'
    );
    
  // Apply filters

  // Student Group Filter on specific student
  if (studentGroup) {
    query = query.where('s.id', studentGroup);
  }

  // Date Range Filter
  if (startDate && endDate) {
    query = query.whereBetween('ar.created_at', [startDate, endDate]);
  }
  
  const results = await query;

  return results.map(row => [
    row.id || 'N/A',
    row.student_name || 'N/A',
    row.course || 'N/A',
    row.status || 'N/A',
    row.grade || 'N/A',
    row.overall_note || 'N/A'
  ]);
}

// Helper function to get counseling sessions data
async function appointmentReport(studentGroup, startDate, endDate, userId) {
  let query = knex('appointments as a')
    .join('students as s', 'a.student_id', 's.id')
    .leftJoin('users as c', 'a.counselor_id', 'c.id')
    .select(
      'a.id as session_id',
      'a.type as appointment_type',
      'a.mode as session_type',
      knex.raw("CONCAT(s.first_name, ' ', s.middle_name, ' ', s.last_name) as student_name"),
      knex.raw("TO_CHAR(a.datetime, 'YYYY-MM-DD') as session_date"),
      'a.status',
      'a.reason as notes'
    );

  // Apply filters
  if (studentGroup) {
    query = query.where('s.id', studentGroup);
  }

  if (startDate && endDate) {
    query = query.whereBetween('a.datetime', [startDate, endDate]);
  }

  const results = await query;
  return results.map(row => [
    row.session_id || 'N/A',
    row.appointment_type || 'N/A',
    row.session_type || 'N/A',
    row.student_name || 'N/A',
    row.session_date ||  'N/A',
    row.status || 'N/A',
    row.notes || 'N/A'
  ]);
}

async function caseRecords(studentGroup, startDate, endDate, userId) {
  let query = knex('case_records as cr')
    .join('students as s', 'cr.student_id', 's.id')
    .leftJoin('users as c', 'cr.user_id', 'c.id')
    .select(
      'cr.id as case_id',
      'cr.case_type',
      'cr.offense as case_offense',
      'cr.session_type',
      knex.raw("CONCAT(s.first_name, ' ', s.middle_name, ' ', s.last_name) as student_name"),
      knex.raw("TO_CHAR(cr.created_at, 'YYYY-MM-DD') as case_date_time"),
      'cr.remarks'
    );

  // Apply filters
  if (studentGroup) {
    query = query.where('s.id', studentGroup);
  }

  if (startDate && endDate) {
    query = query.whereBetween('cr.created_at', [startDate, endDate]);
  }

  const results = await query;
  return results.map(row => [
    row.case_id || 'N/A',
    row.student_name || 'N/A',
    row.case_type || 'N/A',
    row.case_offense || 'N/A',
    row.session_type || 'N/A',
    row.case_date_time || 'N/A',
    row.remarks || 'N/A'
  ]);
}

// Helper function to setup worksheet styles
function setupWorksheetStyles(worksheet, title, headers, data) {
  // Add title
  worksheet.mergeCells('A1:' + String.fromCharCode(64 + headers.length) + '1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  titleCell.font.color = { argb: 'FFFFFFFF' };
  
  // Add generation date
  worksheet.mergeCells('A2:' + String.fromCharCode(64 + headers.length) + '2');
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
  dateCell.font = { size: 10, italic: true };
  dateCell.alignment = { horizontal: 'center' };
  
  // Add headers
  const headerRow = worksheet.getRow(4);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  // Add data
  data.forEach((row, rowIndex) => {
    const dataRow = worksheet.getRow(rowIndex + 5);
    row.forEach((value, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      cell.value = value;
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      // Alternate row colors
      if (rowIndex % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' }
        };
      }
    });
  });
  
  // Auto-fit columns
  worksheet.columns.forEach((column, index) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = Math.min(maxLength + 2, 50);
  });
  
  // Add summary at the bottom
  const summaryRow = worksheet.getRow(data.length + 6);
  const summaryCell = summaryRow.getCell(1);
  summaryCell.value = `Total Records: ${data.length}`;
  summaryCell.font = { bold: true };
}

module.exports = router;