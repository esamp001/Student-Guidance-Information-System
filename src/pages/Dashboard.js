import { Box, Button, Paper, Typography, Chip } from "@mui/material";
import React, { useEffect } from "react";
import theme from "./../theme";
import { navConfig } from "./navConfig";
// Import Users
import StudentDashboard from "./student/StudentDashboard";

//Import SidebarNavBar and TopNavBar
import TopNavBar from "./TopNavBar";
import SideNavBar from "./SideNavBar";

import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const dashboardComponents = {
    student: StudentDashboard,
    // counselor: CounselorDashboard,
    // admin: AdminDashboard,
  };

  return (
    <Box sx={{}}>
      {/* Top Header */}
      <TopNavBar />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Side Nav Items */}
        <SideNavBar />
        {/* Main Content */}
        <Box sx={{ p: 3, width: "100%" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
