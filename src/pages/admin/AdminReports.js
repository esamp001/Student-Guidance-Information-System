import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

const AdminReports = () => {
  const [lookupData, setLookupData] = useState({});
  const [filters, setFilters] = useState({
    reportType: "",
    studentGroup: "",
    counselor: "",
    dateRange: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Lookup for data
  useEffect(() => {
    const handleLookupData = async () => {
      try {
        const response = await fetch("/adminGenerateReportRoute/lookup-data", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLookupData(data);
      } catch (error) {
        console.error("Error looking up data:", error);
      }
    };

    handleLookupData();
  }, []);

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
            <MenuItem value="Guidance Case Records">
              Guidance Case Records
            </MenuItem>
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
          <Button variant="outlined">Export to Excel</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminReports;
