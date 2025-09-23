// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#95c53a", // Main system color (green)
    },
    secondary: {
      main: "#290cba", // Blue
      second: "#f8f6ffff",
    },
    error: {
      main: "#f73a34", // Red
    },
    text: {
      primary: "#474242ff", // Black
      secondary: "#555555", // Subtle gray for less important text
    },
    background: {
      default: "#ffffff", // Page background (white)
      paper: "#f9f9f9", // Cards, dialogs
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

export default theme;
