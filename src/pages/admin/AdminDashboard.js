import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});

  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Cases",
        data: [40, 30, 45, 48, 41, 50, 51, 50, 55, 58, 53, 62],
        borderColor: "#1976d2",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/adminDashboardRoutes/data");
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ title, value }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e0e0e0",
        height: "100%",
      }}
    >
      <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Dashboard Header */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Dashboard Overview
      </Typography>

      {/* Top Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Students Registered" value={dashboardData.students} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Active Counselors" value={dashboardData.counselors} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Active Guidance Cases" value={dashboardData.inProgressGuidanceRecords} />
        </Grid>
      </Grid>

      {/* Monthly Case Trend Chart */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Monthly Case Trend
        </Typography>

        <Line data={data} />
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
