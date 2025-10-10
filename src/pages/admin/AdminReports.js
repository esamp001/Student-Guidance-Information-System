import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

const AdminReports = () => {
  const [filters, setFilters] = useState({
    reportType: "Academic Performance",
    studentGroup: "All Students",
    counselor: "All Counselors",
    dateRange: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Generate Reports
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, fontWeight: 700 }}>
        Select report type and filters to generate comprehensive analytics.
      </Typography>

      <Paper sx={{ p: 3 }}>
        {/* Flex container for filters */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
          }}
        >
          {/* Report Type */}
          <TextField
            select
            label="Report Type"
            name="reportType"
            value={filters.reportType}
            onChange={handleChange}
            sx={{ flex: "1 1 200px" }}
          >
            <MenuItem value="Academic Performance">
              Academic Performance
            </MenuItem>
            <MenuItem value="Student Offense Records">
              Student Offense Records
            </MenuItem>
            <MenuItem value="Counseling Sessions">Counseling Sessions</MenuItem>
          </TextField>

          {/* Student Group */}
          <TextField
            select
            label="Student Group"
            name="studentGroup"
            value={filters.studentGroup}
            onChange={handleChange}
            sx={{ flex: "1 1 200px" }}
          >
            <MenuItem value="All Students">All Students</MenuItem>
            <MenuItem value="Freshmen">Freshmen</MenuItem>
            <MenuItem value="Sophomores">Sophomores</MenuItem>
            <MenuItem value="Graduating">Graduating</MenuItem>
          </TextField>

          {/* Counselor */}
          <TextField
            select
            label="Counselor"
            name="counselor"
            value={filters.counselor}
            onChange={handleChange}
            sx={{ flex: "1 1 200px" }}
          >
            <MenuItem value="All Counselors">All Counselors</MenuItem>
            <MenuItem value="Counselor A">Counselor A</MenuItem>
            <MenuItem value="Counselor B">Counselor B</MenuItem>
          </TextField>

          {/* Date Range */}
          <TextField
            type="date"
            label="Date Range"
            name="dateRange"
            InputLabelProps={{ shrink: true }}
            value={filters.dateRange}
            onChange={handleChange}
            sx={{ flex: "1 1 200px" }}
          />
        </Box>

        {/* Export Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined">Export to PDF</Button>
          <Button variant="outlined">Export to Excel</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminReports;
