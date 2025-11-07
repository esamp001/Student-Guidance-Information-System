import React, { useState , useEffect} from "react";
import { Box, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import { navConfig } from "./navConfig";
import theme from "./../theme";
import { useRole } from "../context/RoleContext";

const SideNavBar = () => {
  const { user, role } = useRole();
  const navItems = navConfig[role] || [];

  return (
    <Box
      sx={{
        borderRight: "1px solid gray",
        width: "20%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={`/dashboard/${item.path}`}
          end={item.path === role}
          style={{ textDecoration: "none" }}
        >
          {({ isActive }) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mt: 1,
                cursor: "pointer",
                height: 40,
                p: 2,
                borderRadius: 2,
                bgcolor: isActive
                  ? theme.palette.text.secondary
                  : "transparent",
                color: isActive ? "#fff" : theme.palette.text.primary,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: theme.palette.text.secondary,
                  color: "#fff",
                },
              }}
            >
              {item.icon}

              <Typography
                sx={{
                  fontWeight: isActive ? 600 : 400,
                  color: "inherit",
                }}
              >
                {item.label}
              </Typography>

              {/* STATIC BADGE ON THE RIGHT */}
              {item.label === "Messages" && (<Box
                sx={{
                  ml: 1,        // PUSH BADGE TO RIGHT
                  bgcolor: "#ff7676",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "12px",
                  px: 1,
                  py: "2px",
                }}
              >
                0
              </Box>)}
            </Box>
          )}
        </NavLink>
      ))}
    </Box>
  );
};

export default SideNavBar;
