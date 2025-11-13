import React, { useState, useEffect } from "react";
import RemoveCircleTwoToneIcon from "@mui/icons-material/RemoveCircleTwoTone";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import useSnackbar from "../../hooks/useSnackbar";
import { Add, Visibility, Search, Save } from "@mui/icons-material";
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
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  TableContainer,
} from "@mui/material";

const StudentManagement = () => {
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  // States
  const [academicRecords, setAcademicRecords] = useState([]);
  const [overallNotes, setOverallNotes] = useState({});
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [originalRecords, setOriginalRecords] = useState([]);
  const [originalOverallNote, setOriginalOverallNote] = useState("");
  const [inputValue, setInputValue] = useState(""); // what user types
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    year: "",
    contact: "",
    behavior: "",
  });

  const handleOpen = (student = null) => {
    setFormData(
      student || { id: null, name: "", year: "", contact: "", behavior: "" }
    );
    setOpen(true);
  };

  const handleOverallNoteChange = (studentId, value) => {
    setOverallNotes((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleAddRecord = () => {
    if (!selectedStudent) return;

    setAcademicRecords((prev) => [
      ...prev,
      {
        student_id: selectedStudent.id,
        course: "",
        grade: "",
      },
    ]);
  };

  const handleDeleteRecord = (index) => {
    setAcademicRecords((prev) => prev.filter((_, i) => i !== index));
  };
  // API
  const handleSaveAll = async () => {
    if (!selectedStudent) {
      showSnackbar("Please select a student first.", "warning");
      return;
    }

    try {
      const response = await fetch(
        "/adminAcademicRecordsRoutes/admin/save/academic_record",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            student_id: selectedStudent.id,
            overall_note: Object.values(overallNotes)[0],
            records: academicRecords,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save academic records");
      } else {
        showSnackbar("Academic records saved successfully!", "success");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("An error occurred while saving records.", "error");
    }
  };

  useEffect(() => {
    const fetchAcademicRecords = async () => {
      if (!selectedStudent) return;

      try {
        const response = await fetch(
          `/adminAcademicRecordsRoutes/admin/get/academic_record/${selectedStudent.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();

        const mappedRecords = data.records.map((r) => ({
          id: r.id,
          student_id: r.student_id,
          course: r.course || "",
          grade: r.grade || "",
        }));

        setAcademicRecords(mappedRecords);

        setOverallNotes((prev) => ({
          ...prev,
          [selectedStudent.id]: data.records?.[0]?.overall_note || "",
        }));

        // store original for comparison
        setOriginalRecords(mappedRecords);
        setOriginalOverallNote(data.records?.[0]?.overall_note || "");
      } catch (err) {
        showSnackbar("Failed to load academic records.", "error");
      }
    };

    fetchAcademicRecords();
  }, [selectedStudent]);

  const handleRecordChange = (index, key, value) => {
    setAcademicRecords((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
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

  // Student Look Up
  useEffect(() => {
    // Fetch students when inputValue changes
    if (inputValue.length === 0) {
      setStudents([]); // clear if input is empty
      return;
    }

    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `/adminAcademicRecordsRoutes/admin/all_students/lookup?search=${encodeURIComponent(
            inputValue
          )}`
        );
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data); // update options dynamically
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudents();
  }, [inputValue]);

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
          <Tab label="Academic Records" />
        </Tabs>
      </Paper>

      {/* Student Profiles Tab */}

      {tab === 0 && (
        <Paper
          sx={{ p: 2, borderRadius: 3, boxShadow: 3, border: "1px solid" }}
        >
          <Typography variant="h6" gutterBottom>
            Academic Records
          </Typography>

          {/*  Search Bar */}
          <Autocomplete
            options={students}
            getOptionLabel={(option) => option.full_name || ""}
            value={selectedStudent}
            onChange={(event, newValue) => setSelectedStudent(newValue)}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) =>
              setInputValue(newInputValue)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Student"
                variant="outlined"
                size="small"
                sx={{ mb: 3, width: "100%" }}
              />
            )}
          />

          {/* Show selected student info */}
          {selectedStudent ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#fafafa",
              }}
            >
              {/* Student Header Row */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedStudent?.full_name || "No student selected"}
                </Typography>

                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleAddRecord(selectedStudent?.id)}
                  disabled={!selectedStudent} // disable if no student selected
                >
                  Add Record
                </Button>
              </Box>

              {/* Student Academic Records Table */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Course / Subject
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Grade</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedStudent ? (
                      academicRecords
                        // .filter((r) => r.student_id === selectedStudent.id)
                        .map((record, index) => (
                          <TableRow key={index} hover>
                            {/* Course */}
                            <TableCell sx={{ width: "45%" }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Course/Subject"
                                value={record.course}
                                onChange={(e) =>
                                  handleRecordChange(
                                    index,
                                    "course",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>

                            {/* Grade */}
                            <TableCell sx={{ width: "25%" }}>
                              <FormControl fullWidth size="small">
                                <Select
                                  value={record.grade || ""}
                                  onChange={(e) =>
                                    handleRecordChange(
                                      index,
                                      "grade",
                                      e.target.value
                                    )
                                  }
                                >
                                  {[
                                    "A+",
                                    "A",
                                    "A-",
                                    "B+",
                                    "B",
                                    "B-",
                                    "C+",
                                    "C",
                                    "C-",
                                    "D",
                                    "F",
                                  ].map((g) => (
                                    <MenuItem key={g} value={g}>
                                      {g}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>

                            {/* Actions */}
                            <TableCell align="right" sx={{ width: "10%" }}>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteRecord(index)}
                              >
                                <RemoveCircleTwoToneIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          Please select a student first.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Overall Note Section */}
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Overall Academic Note
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Write overall remarks about this student's academic performance..."
                value={
                  selectedStudent ? overallNotes[selectedStudent.id] || "" : ""
                }
                onChange={(e) =>
                  handleOverallNoteChange(selectedStudent?.id, e.target.value)
                }
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                💡 Tip: Use keywords like “excellent,” “good,” “average,”
                “warning,” or “poor” in your overall note to automatically
                display the matching behavior icon and smart tag.
              </Typography>

              {/* Save Button */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 3,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleSaveAll}
                  disabled={
                    !selectedStudent ||
                    (JSON.stringify(academicRecords) ===
                      JSON.stringify(originalRecords) &&
                      overallNotes[selectedStudent.id] === originalOverallNote)
                  }
                >
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography align="center" sx={{ mt: 3 }}>
              Search for a student to view records
            </Typography>
          )}
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
      {SnackbarComponent}
    </Box>
  );
};

export default StudentManagement;
