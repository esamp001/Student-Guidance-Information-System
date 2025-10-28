import React, { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// MUI Alert wrapper
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Reusable hook
export default function useSnackbar() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'success' | 'error' | 'warning' | 'info'
  });

  // Trigger snackbar
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  // Improved Snackbar design at top
  const SnackbarComponent = (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ mt: 2 }} // spacing from top
    >
      <Alert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        sx={{
          width: { xs: "90%", sm: "400px" }, // responsive width
          fontSize: 14,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );

  return { snackbar, setSnackbar, showSnackbar, SnackbarComponent };
}
