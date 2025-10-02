import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";

const caseTypes = [
  {
    group: "Academic Counseling",
    items: [
      "Low Academic Performance",
      "Study Habits / Time Management",
      "Absenteeism",
      "Learning Difficulties",
    ],
  },
  {
    group: "Behavioral Support",
    items: [
      "Disciplinary Case",
      "Bullying / Peer Conflict",
      "Emotional / Mental Health Concern",
      "Substance-Related Concern",
      "Family-Related Issue",
    ],
  },
  {
    group: "Career Guidance",
    items: [
      "Course / Strand Selection",
      "Career Planning",
      "Work Readiness / Internship",
      "Vocational Testing / Interest Assessment",
    ],
  },
];
const CaseRecords = () => {
  const [offenses, setOffenses] = useState([]);
  const [formData, setFormData] = useState({
    studentName: "",
    caseType: "",
    offense: "",
    date: "",
    remarks: "",
  });

  console.log(formData, "formData");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaseType = (event) => {
    setFormData({ ...formData, caseType: event.target.value });
  };

  const handleAddOffense = () => {
    if (!formData.studentName || !formData.offense) return;
    setOffenses([
      ...offenses,
      {
        id: offenses.length + 1,
        ...formData,
      },
    ]);
    setFormData({
      studentName: "",
      offense: "",
      caseType: "",
      date: "",
      remarks: "",
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Typography variant="h5" gutterBottom>
        Student Offense Records
      </Typography>

      {/* Manual Add Offense */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Offense
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Student Name"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Offense"
              name="offense"
              value={formData.offense}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              sx={{ width: 150 }}
              select
              fullWidth
              label="Case Type"
              name="case-type"
              value={formData.caseType}
              onChange={handleCaseType}
            >
              <MenuItem value="Academic Counseling">
                Academic Counseling
              </MenuItem>
              <MenuItem value="Behavioral Support">Behavioral Support</MenuItem>
              <MenuItem value="Career Guidance">Career Guidance</MenuItem>
              <MenuItem value="Academic Counseling">
                Academic Counseling
              </MenuItem>
              <MenuItem value="Low Academic Performance">
                Low Academic Performance
              </MenuItem>
              <MenuItem value="Study Habits / Time Management">
                Study Habits / Time Management
              </MenuItem>
              <MenuItem value="Absenteeism">Absenteeism</MenuItem>
              <MenuItem value="Learning Difficulties">
                Learning Difficulties
              </MenuItem>
              <MenuItem value="Personal / Emotional Support">
                Personal / Emotional Support
              </MenuItem>
              <MenuItem value="Conflict Resolution">
                Conflict Resolution
              </MenuItem>
              <MenuItem value="Health / Medical Concerns">
                Health / Medical Concerns
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleAddOffense}>
              Save Offense
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Display Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Offense Records List
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Case Type</TableCell>
              <TableCell>Offense</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offenses.map((o, index) => (
              <TableRow key={index}>
                <TableCell>{o.id}</TableCell>
                <TableCell>{o.studentName}</TableCell>
                <TableCell>{o.caseType}</TableCell>
                <TableCell>{o.offense}</TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell>{o.remarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default CaseRecords;
