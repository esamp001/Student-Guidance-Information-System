import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import { navConfig } from "./navConfig";
import theme from "./../theme";
import { useRole } from "../context/RoleContext";

const SideNavBar = () => {
  const { role } = useRole();
  const navItems = navConfig[role] || [];
  const location = useLocation(); // current URL path

  return (
    <Box
      sx={{
        borderRight: "1px solid gray",
        width: "20%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {navItems.map((item, index) => {
        // Check if the current route starts with the item's path
        const isActive = location.pathname.includes(item.path) || "";
        location.pathname.startsWith(item.path + "/");

        return (
          <NavLink
            key={index}
            to={item.path}
            style={{ textDecoration: "none" }}
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
                bgcolor: isActive
                  ? theme.palette.text.secondary
                  : "transparent",
                color: isActive ? "#ffffffff" : theme.palette.text.primary,
                "&:hover": {
                  bgcolor: theme.palette.text.secondary,
                  color: "#ffffffff",
                },
              }}
            >
              {item.icon}
              <Typography>{item.label}</Typography>
            </Box>
          </NavLink>
        );
      })}
    </Box>
  );
};

export default SideNavBar;
