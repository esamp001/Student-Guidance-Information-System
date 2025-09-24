import React from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { navConfig } from "./navConfig";
import theme from "./../theme";
import { useRole } from "../context/RoleContext";

const SideNavBar = () => {
  const { role } = useRole();
  const navItems = navConfig[role] || [];

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
        <Link
          key={index}
          to={item.path}
          style={{ textDecoration: "none", color: "inherit" }} // keeps style clean
        >
          <Box
            key={index}
            sx={{
              color: theme.palette.text.secondary,
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              mt: 2,
              ml: 2,
              cursor: "pointer",
              "&:hover": { color: theme.palette.text.primary },
            }}
          >
            {item.icon}
            <Typography>{item.label}</Typography>
          </Box>
        </Link>
      ))}
    </Box>
  );
};

export default SideNavBar;
