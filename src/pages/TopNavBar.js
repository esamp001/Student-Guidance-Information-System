import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Avatar } from "@mui/material";
import theme from "./../theme";
import { useRole } from "../context/RoleContext";

const TopNavBar = () => {
  const { role } = useRole();
  const [show, setShow] = useState(true); // Track visibility
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
      // Scrolling down → hide
      setShow(false);
    } else {
      // Scrolling up → show
      setShow(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <Box
      sx={{
        borderBottom: "1px solid gray",
        height: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", // ← This makes it stick
        top: 0, // ← Stick to the top
        zIndex: 1000, // ← Stay above other content
        bgcolor: theme.palette.background.default, // Optional: set a background
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          component="img"
          src="/letranseal.png"
          alt="Letran Seal"
          sx={{ width: 45, height: 45, ml: 3 }}
        />
        <Typography variant="h6" sx={{ ml: 2, fontWeight: "bold" }}>
          Students Information System
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography sx={{ fontWeight: 700 }}>Alex Johnson</Typography>
        <Avatar sx={{ bgcolor: "primary" }}>A</Avatar>
        <Button
          sx={{
            bgcolor: theme.palette.error.main,
            color: "white",
            mr: 3,
            "&:hover": { bgcolor: theme.palette.error.dark },
          }}
          size="medium"
          variant="contained"
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default TopNavBar;
