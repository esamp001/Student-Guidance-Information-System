// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#386641", // Main system color (green)
      secondary: "#6A994E",
      tertiary: "#A7C957",
      light: "#F2E8CF",
      red: "#BC4749",
      contrastText: "#fff", // Ensures text is white on primary background
    },
    secondary: {
      main: "#290cba",
      second: "#f8f6ffff",
      contrastText: "#fff", // White text for secondary buttons too
    },
    outletbg: {
      main: "#f5f5f5ff",
    },
    error: {
      main: "#f73a34",
      contrastText: "#fff",
    },
    text: {
      primary: "#474242ff",
      secondary: "#555555",
      tertiary: "#121212ff",
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
