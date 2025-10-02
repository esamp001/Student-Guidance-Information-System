import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

const CounselorStaffManagement = () => {
  const [counselors, setCounselors] = useState([
    { id: 1, name: "Maria Santos", role: "Guidance Counselor" },
    { id: 2, name: "Juan Cruz", role: "Psychologist" },
  ]);

  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [current, setCurrent] = useState({ id: null, name: "", role: "" });

  const handleOpen = (mode, counselor = { id: null, name: "", role: "" }) => {
    setFormMode(mode);
    setCurrent(counselor);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = () => {
    if (formMode === "add") {
      setCounselors([...counselors, { ...current, id: Date.now() }]);
    } else {
      setCounselors(counselors.map((c) => (c.id === current.id ? current : c)));
    }
    handleClose();
  };

  const handleDelete = (id) => {
    setCounselors(counselors.filter((c) => c.id !== id));
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
          Add Staff
        </Button>
      </Box>

      <Grid container spacing={2}>
        {counselors.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, width: 300, p: 1 }}>
              <CardContent>
                <Typography variant="h6">{c.name}</Typography>
                <Typography color="text.secondary">{c.role}</Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", gap: 2 }}>
                <Typography
                  onClick={() => handleOpen("edit", c)}
                  sx={{ fontWeight: 500, cursor: "pointer" }}
                  color="primary"
                >
                  Modify
                </Typography>
                <Typography
                  onClick={() => handleDelete(c.id)}
                  sx={{ fontWeight: 500, cursor: "pointer" }}
                  color="error"
                >
                  Delete
                </Typography>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {formMode === "add" ? "Add Counselor/Staff" : "Edit Counselor/Staff"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={current.name}
            onChange={(e) => setCurrent({ ...current, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Role"
            fullWidth
            value={current.role}
            onChange={(e) => setCurrent({ ...current, role: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CounselorStaffManagement;
