import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useRole } from "../../context/RoleContext";

const ReportsCounselor = () => {
  const { user } = useRole();
  const [filters, setFilters] = useState({
    reportType: "",
    studentGroup: "",
    startDate: "",
    endDate: "",
  });
  console.log(filters, "filtersxxxx")
  const [loading, setLoading] = useState(false);
  const [lookupData, setLookupData] = useState({});
  console.log(lookupData, "lookupDataxxxx")
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  

  // Look up data
  useEffect(() => {
    const handleLookupData = async () => {
      try {
        const response = await fetch('/counselorGenerateReportRoute/lookup-data/?GenerateReport=' + filters.reportType, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLookupData(data);

      } catch (error) {
        console.error('Error looking up data:', error);
      }
    };

    handleLookupData();
  }, [filters.reportType]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExportToExcel = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/counselorGenerateReportRoute/generate-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: filters.reportType,
          studentGroup: filters.studentGroup,
          startDate: filters.startDate,
          endDate: filters.endDate,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${filters.reportType.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setNotification({
        open: true,
        message: "Excel report generated and downloaded successfully!",
        severity: "success"
      });
      
    } catch (error) {
      console.error('Error generating Excel report:', error);
      setNotification({
        open: true,
        message: "Failed to generate Excel report. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
            <MenuItem value="Appointment Report">
              Appointment Report
            </MenuItem>
            <MenuItem value="Case Records">Case Records</MenuItem>
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
            {lookupData.StudentGroup?.map((student) => (
              <MenuItem key={student.id} value={parseInt(student.id)}>
                {`${student.first_name} ${student.middle_name} ${student.last_name}`}
              </MenuItem>

            ))}
          </TextField>

          {/* Date Range */}
          <TextField
            type="date"
            label="Start Date"
            name="startDate"
            InputLabelProps={{ shrink: true }}
            value={filters.startDate}
            onChange={handleChange}
            sx={{ flex: "1 1 200px" }}
          />

          <TextField
            type="date"
            label="End Date"
            name="endDate"
            InputLabelProps={{ shrink: true }}
            value={filters.endDate}
            onChange={handleChange}
            sx={{ flex: "1 1 200px" }}
          />
        
        </Box>

        {/* Export Buttons */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button 
            variant="contained"
            onClick={handleExportToExcel}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ minWidth: 140 }}
          >
            {loading ? "Generating..." : "Export to Excel"}
          </Button>
        </Box>
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsCounselor;
