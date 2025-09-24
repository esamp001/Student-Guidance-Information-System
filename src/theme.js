// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#95c53a", // Main system color (green)
      contrastText: "#fff", // Ensures text is white on primary background
    },
    secondary: {
      main: "#290cba",
      second: "#f8f6ffff",
      contrastText: "#fff", // White text for secondary buttons too
    },
    error: {
      main: "#f73a34",
      contrastText: "#fff",
    },
    text: {
      primary: "#474242ff",
      secondary: "#555555",
    },
    background: {
      default: "#ffffff",
      paper: "#f9f9f9",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

export default theme;
