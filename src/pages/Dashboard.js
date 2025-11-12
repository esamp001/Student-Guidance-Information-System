import React, { useState } from "react";
import { Box } from "@mui/material";
import theme from "./../theme";

//Import SidebarNavBar and TopNavBar
import TopNavBar from "./TopNavBar";
import SideNavBar from "./SideNavBar";

// React Router
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Top Header */}
      <TopNavBar handleDrawerToggle={handleDrawerToggle} sx={{ position: "relative" }} />
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Side Nav Items */}
        <SideNavBar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
        {/* Main Content */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            width: "100%",
            flex: 1,
            overflow: "auto",
            overscrollBehavior: "contain",
            bgcolor: theme.palette.outletbg.main,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
