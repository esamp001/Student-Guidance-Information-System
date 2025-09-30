import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import { navConfig } from "./navConfig";
import theme from "./../theme";
import { useRole } from "../context/RoleContext";

const SideNavBar = () => {
  const { role } = useRole();
  const navItems = navConfig[role] || [];

  // default highlight index 0 (Dashboard)
  const [sideBar, setSideBar] = useState(0);

  const location = useLocation();

  // update active index when route changes
  useEffect(() => {
    const foundIndex = navItems.findIndex(
      (item) => item.path === location.pathname
    );
    if (foundIndex !== -1) {
      setSideBar(foundIndex);
    }
  }, [location.pathname, navItems]);

  return (
    <Box
      sx={{
        border: "1px solid gray",
        width: "20%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          style={{ textDecoration: "none" }}
          onClick={() => setSideBar(index)}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mt: 1,
              cursor: "pointer",
              height: 40,
              p: 2,
              bgcolor:
                sideBar === index
                  ? theme.palette.text.secondary
                  : "transparent",
              color: sideBar === index ? "#fff" : theme.palette.text.primary,
              "&:hover": {
                bgcolor: theme.palette.text.secondary,
                color: "#fff",
              },
            }}
          >
            {item.icon}
            <Typography>{item.label}</Typography>
          </Box>
        </NavLink>
      ))}
    </Box>
  );
};

export default SideNavBar;
