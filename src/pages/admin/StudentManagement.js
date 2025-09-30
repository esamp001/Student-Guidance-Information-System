import React, { useState } from "react";
import RemoveCircleTwoToneIcon from "@mui/icons-material/RemoveCircleTwoTone";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  InputAdornment,
} from "@mui/material";
import { Add, Edit, Delete, Visibility, Search } from "@mui/icons-material";

const sampleStudents = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    year: "3rd Year",
    contact: "09123456789",
    behavior: "Needs counseling follow-up",
  },
  {
    id: 2,
    name: "Maria Santos",
    year: "2nd Year",
    contact: "09987654321",
    behavior: "Good standing",
  },
  {
    id: 3,
    name: "Pedro Reyes",
    year: "1st Year",
    contact: "0911222333",
    behavior: "Pending counseling session",
  },
];

const StudentManagement = () => {
  const [students, setStudents] = useState(sampleStudents);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    year: "",
    contact: "",
    behavior: "",
  });
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");

  const handleOpen = (student = null) => {
    setFormData(
      student || { id: null, name: "", year: "", contact: "", behavior: "" }
    );
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = () => {
    if (formData.id) {
      setStudents((prev) =>
        prev.map((s) => (s.id === formData.id ? formData : s))
      );
    } else {
      setStudents((prev) => [...prev, { ...formData, id: Date.now() }]);
    }
    handleClose();
  };

  const handleDelete = (id) =>
    setStudents((prev) => prev.filter((s) => s.id !== id));

  // Filter students by search term
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.year.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.includes(search)
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Student Management
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          textColor="primary"
        >
          <Tab label="Student Profiles" />
          <Tab label="Behavior & Counseling" />
        </Tabs>
      </Paper>

      {/* Student Profiles Tab */}
      {tab === 0 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <TextField
              variant="outlined"
              placeholder="Search students..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: "85%" }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpen()}
            >
              Add Student
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell>{student.contact}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(student)}>
                      <DriveFileRenameOutlineRoundedIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(student.id)}>
                      <RemoveCircleTwoToneIcon color="error" />
                    </IconButton>
                    <IconButton>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No matching records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Behavior & Counseling History */}
      {tab === 1 && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Behavior / Counseling Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.behavior}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formData.id ? "Edit Student" : "Add Student"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) =>
              setFormData((f) => ({ ...f, name: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Year"
            fullWidth
            value={formData.year}
            onChange={(e) =>
              setFormData((f) => ({ ...f, year: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Contact"
            fullWidth
            value={formData.contact}
            onChange={(e) =>
              setFormData((f) => ({ ...f, contact: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Behavior / Counseling Notes"
            fullWidth
            value={formData.behavior}
            onChange={(e) =>
              setFormData((f) => ({ ...f, behavior: e.target.value }))
            }
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

export default StudentManagement;
