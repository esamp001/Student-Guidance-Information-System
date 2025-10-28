import React, { useState, useEffect } from "react";
import useSnackbar from "../../hooks/useSnackbar";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  DialogContentText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useRole } from "../../context/RoleContext";

const CounselorStaffManagement = () => {
  const [loading, setLoading] = useState(false);
  const [counselors, setCounselors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");

  const handleOpen = (mode, id) => {
    setFormMode(mode);
    if (mode === "edit") {
      // find the counselor with that ID from your state
      const selected = counselors.find((c) => c.id === id);

      if (selected) {
        setFormData({
          id: selected.id,
          first_name: selected.first_name,
          middle_name: selected.middle_name,
          last_name: selected.last_name,
          specialization: selected.specialization,
          email: selected.email || "",
          password: "",
          confirmPassword: "",
        });
      }
    } else {
      // Add mode - blank form
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        specialization: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }

    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const validateAddCounselor = (formData) => {
    const {
      first_name,
      last_name,
      email,
      contact_number,
      password,
      confirmPassword,
    } = formData;

    if (!first_name || !last_name || !email) {
      return "Please fill in all required fields.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (password && confirmPassword && password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (contact_number && !/^\d{10,12}$/.test(contact_number)) {
      return "Please enter a valid contact number (10–12 digits).";
    }

    return null;
  };

  const validateAddCounselorUpdate = (formData) => {
    const { first_name, last_name, contact_number, password, confirmPassword } =
      formData;

    if (!first_name || !last_name) {
      return "Please fill in all required fields.";
    }

    if (password && confirmPassword && password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (contact_number && !/^\d{10,12}$/.test(contact_number)) {
      return "Please enter a valid contact number (10–12 digits).";
    }

    return null;
  };

  // API
  const handleSave = async () => {
    try {
      // Call the validation function
      const validationError = validateAddCounselor(formData);
      if (validationError) {
        showSnackbar(validationError, "error");
        return; // stop if invalid
      }

      // Proceed only if validation passes
      const response = await fetch("/adminAddCounselor/admin/add_counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save counselor");
      }

      // Reset form properly after success
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        specialization: "",
        email: "",
        contact_number: "",
        password: "",
        confirmPassword: "",
      });

      showSnackbar("Counselor saved successfully!", "success");
    } catch (error) {
      console.error("Error saving counselor:", error);
      showSnackbar(error.message || "An error occurred while saving.", "error");
    }
  };

  const handleUpdate = async () => {
    // Call the validation function
    const validationError = validateAddCounselorUpdate(formData);
    if (validationError) {
      showSnackbar(validationError, "error");
      return; // stop if invalid
    }

    if (!formData.id) {
      console.error("No counselor selected to update");
      return;
    }

    try {
      const response = await fetch(
        `/adminAddCounselor/admin/update_counselor/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Show error snackbar
        showSnackbar(data.error || "Failed to update counselor");
        return;
      }

      // Success snackbar
      showSnackbar("Counselor updated successfully!");

      // Update local state
      setCounselors((prev) =>
        prev.map((c) => (c.id === formData.id ? { ...c, ...formData } : c))
      );

      // Optionally close modal/form
      setOpen(false);
    } catch (error) {
      console.error("Error updating counselor:", error);
      showSnackbar("Error updating counselor");
    }
  };

  // Look up for added counselor
  useEffect(() => {
    setLoading(true);

    const loadCounselorLookup = async () => {
      try {
        const response = await fetch(
          "/adminAddCounselor/admin/counselor_lookup",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch counselor data");
        }

        const data = await response.json();
        setCounselors(data);
      } catch (error) {
        console.error("Error loading counselor lookup:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCounselorLookup();
  }, []);

  // Delete
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `/adminAddCounselor/admin/delete_counselor/${selectedId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete counselor");
      }

      // Remove counselor from UI
      setCounselors((prev) => prev.filter((c) => c.id !== selectedId));

      // Close dialog
      setOpenConfirm(false);
    } catch (error) {
      console.error("Error deleting counselor:", error);
    }
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Counselor & Staff Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen("add")}
        >
          Add Counselor
        </Button>
      </Box>

      <Grid container spacing={2}>
        {counselors.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, width: 300, p: 1 }}>
              <CardContent>
                <Typography variant="h6">{c.first_name}</Typography>
                <Typography color="text.secondary">{c.last_name}</Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", gap: 2 }}>
                <Typography
                  onClick={() => handleOpen("edit", c.id)}
                  sx={{ fontWeight: 500, cursor: "pointer" }}
                  color="primary"
                >
                  Modify
                </Typography>
                <Typography
                  onClick={() => {
                    setSelectedId(c.id); // store the counselor ID
                    setOpenConfirm(true); // open confirmation dialog
                  }}
                  sx={{ fontWeight: 500, cursor: "pointer" }}
                  color="error"
                >
                  Delete
                </Typography>

                <Dialog
                  open={openConfirm}
                  onClose={() => setOpenConfirm(false)}
                >
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to delete this counselor? This
                      action cannot be undone.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>
                      Cancel
                    </Button>
                    <Button
                      color="error"
                      variant="contained"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </DialogActions>
                </Dialog>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {formMode === "add" ? "Add Counselor" : "Edit Counselor"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="First Name"
            fullWidth
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Middle Name"
            fullWidth
            value={formData.middle_name}
            onChange={(e) =>
              setFormData({ ...formData, middle_name: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Specialization"
            fullWidth
            value={formData.specialization}
            onChange={(e) =>
              setFormData({ ...formData, specialization: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Confirm Password"
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            error={
              formData.confirmPassword !== formData.password &&
              formData.confirmPassword.length > 0
            }
            helperText={
              formData.confirmPassword !== formData.password &&
              formData.confirmPassword.length > 0
                ? "Passwords do not match"
                : ""
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={formMode === "edit" ? handleUpdate : handleSave}
          >
            {formMode === "edit" ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      {SnackbarComponent}
    </Box>
  );
};

export default CounselorStaffManagement;
