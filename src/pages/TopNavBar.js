import React from "react";
import { Box, Typography, Button } from "@mui/material";
import theme from "./../theme";
import { navConfig } from "./navConfig";
import { useRole } from "../context/RoleContext";

const TopNavBar = () => {
  const { role } = useRole();
  const navItems = navConfig[role] || [];

  return (
    <Box
      sx={{
        border: "1px solid gray",
        height: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* Logo */}
        <Box
          component="img"
          src="/letranseal.png"
          alt="Letran Seal"
          sx={{ width: 45, height: 45, ml: 3 }}
        />

        {/* Title */}
        <Typography variant="h6" sx={{ ml: 2, fontWeight: "bold" }}>
          Students Information System
        </Typography>
      </Box>
      {/* Top Nav Items */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          flexGrow: 1, // take available space
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            flexGrow: 1,
          }}
        >
          {navItems.map((item, index) => (
            <Typography
              key={index}
              sx={{
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": {
                  color: "primary.main",
                  textDecoration: "underline",
                },
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Logout Button */}
      <Button
        sx={{
          bgcolor: theme.palette.error.main,
          color: "white",
          mr: 3,
          "&:hover": {
            bgcolor: theme.palette.error.dark, // optional: darker red on hover
          },
        }}
        size="medium"
        variant="contained"
      >
        Logout
      </Button>
    </Box>
  );
};

export default TopNavBar;
