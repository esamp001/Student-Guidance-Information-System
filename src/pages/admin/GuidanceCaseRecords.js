import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Tooltip,
  Menu,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  History as HistoryIcon,
  Autorenew,
} from "@mui/icons-material";

// Sample data
// const defaultCases = [
//   {
//     id: 1,
//     studentName: "Juan Dela Cruz",
//     studentId: "STU-001",
//     caseType: "Academic",
//     summary: "Falling behind in Math",
//     assignedTo: "Ms. Santos",
//     status: "Open",
//     createdAt: "2025-09-20",
//     history: [
//       {
//         date: "2025-09-20",
//         note: "Initial intake. Referred to subject teacher.",
//         actor: "Ms. Santos",
//       },
//     ],
//   },
//   {
//     id: 2,
//     studentName: "Maria Clara",
//     studentId: "STU-002",
//     caseType: "Behavioral",
//     summary: "Frequent classroom disruptions",
//     assignedTo: "Mr. Reyes",
//     status: "In Progress",
//     createdAt: "2025-09-18",
//     history: [
//       {
//         date: "2025-09-18",
//         note: "Meeting with student. Behaviour plan drafted.",
//         actor: "Mr. Reyes",
//       },
//       {
//         date: "2025-09-23",
//         note: "Follow-up. Some improvement observed.",
//         actor: "Mr. Reyes",
//       },
//     ],
//   },
// ];

const CASE_TYPES = ["Academic", "Personal", "Behavioral"];
const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"];

const GuidanceCaseRecords = () => {
  const [cases, setCases] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [openForm, setOpenForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCaseForMenu, setSelectedCaseForMenu] = useState(null);
  const [historyModal, setHistoryModal] = useState({
    open: false,
    caseItem: null,
  });

  const [lookup, setLookup] = useState({
    students: [],
    counselors: [],
  });

  const [formData, setFormData] = useState({
    student_name: "",
    student_id: "",
    appointment_id: "",
    case_type: "",
    summary: "",
    assigned_to: "",
    counselor_id: "",
    remarks: ""
  });

  console.log(formData, "formData")

  // API - Look up for students who initiated first and have a follow up session status
//  useEffect(() => {
//    const fetchStudentsRecords = async () => {
//     try {
//       const response = await fetch("/adminGuidanceCaseRecords/admin/students/lookup");
//       const data = await response.json();
//       console.log(data);
//       setCases(data);
//     } catch (error) {
//       console.error("Error fetching students records:", error);
//     }
//    }
//    fetchStudentsRecords();
//  }, [])

// API - Auto create guidance case records
  useEffect(() => {
    const fetchAndCreateCases = async () => {
      try {
        // 1️ Fetch the lookup data
        const response = await fetch("/adminGuidanceCaseRecords/admin/students/lookup");
        const data = await response.json();
        console.log("Lookup data:", data);
        setCases(data);

        // 2️ Automatically create guidance case records
        for (const record of data) {
          console.log(record, "record")
          // Example payload — adjust fields to match your backend
          const payload = {
            appointment_id: record.appointment_id,
            student_id: record.student_id,
            counselor_id: record.counselor_id,
            case_type: record.case_type || "student_initiated",
            status: record.status,
            summary: record.remarks || "",
            remarks: record.case_status || ""
          };

          await fetch("/adminGuidanceCaseRecords/guidanceCaseRecords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }

      } catch (error) {
        console.error("Error fetching or creating cases:", error);
      }
    };

    fetchAndCreateCases();
  }, []);


// API - Look up for case to be auto filled on form
  const fetchLookupForm = async () => {
    try {
      const response = await fetch("/adminGuidanceCaseRecords/students/counselor/lookup");
      const data = await response.json();

      // Save to state
      setLookup({
        students: data.students || [],
        counselors: data.counselors || [],
      });

    } catch (err) {
      console.error("Error fetching lookup data:", err);
    }
  };

 // API - Lookup for counselor initiated case records
//  useEffect(() => {
//    const fetchCounselorRecords = async () => {
//     try {
//       const response = await fetch("/adminGuidanceCaseRecords/admin/counselor/lookup");
//       const data = await response.json();
//       console.log(data);
//       setCases(data);
//     } catch (error) {
//       console.error("Error fetching counselor records:", error);
//     }
//    }
//    fetchCounselorRecords();
//  }, [])

 // API - Handle Edit for both counselor and student initiated case records

  const filteredCases = useMemo(() => {
    if (filterStatus === "All") return cases;
    return cases.filter((c) => c.status === filterStatus);
  }, [cases, filterStatus]);

  // ---- Handlers ----
  function openAdd() {
    fetchLookupForm()
    setEditingCase({
      studentName: "",
      studentId: "",
      caseType: "Academic",
      summary: "",
      assignedTo: "",
      status: "Open",
    });
    setOpenForm(true);
  }

  function openEdit(caseItem) {
    setEditingCase({ ...caseItem });
    setOpenForm(true);
  }

  function closeForm() {
    setEditingCase(null);
    setOpenForm(false);
  }

  function saveCase() {
    if (!formData.student_name?.trim() || !formData.summary?.trim()) {
      alert("Please fill student name and summary.");
      return;
    }
    // API - Post it to guidance case records table - When counselor initated
    const handleSaveCase = async () => {

      try {
        const response = await fetch("/adminGuidanceCaseRecords/saveCase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            appointment_id: selectedCaseForMenu.appointment_id
          }),
        });
        const data = await response.json();
        console.log(data);
        // setCases((prev) => [data, ...prev]);
      } catch (err) {
        console.error("Error saving case:", err);
        throw new Error("Failed to save case");
      }
    };
    handleSaveCase();

    // if (editingCase.id) {
    //   setCases((prev) =>
    //     prev.map((c) => (c.id === editingCase.id ? { ...editingCase } : c))
    //   );
    // } else {
    //   const newCase = {
    //     ...editingCase,
    //     id: Math.max(0, ...cases.map((c) => c.id)) + 1,
    //     createdAt: new Date().toISOString().slice(0, 10),
    //     history: [
    //       {
    //         date: new Date().toISOString().slice(0, 10),
    //         note: "Case created.",
    //         actor: editingCase.assignedTo || "System",
    //       },
    //     ],
    //   };
    //   setCases((prev) => [newCase, ...prev]);
    // }
    closeForm();
  }

  function askDelete(caseId) {
    setConfirmDelete({ open: true, id: caseId });
  }

  function confirmDeleteCase() {
    setCases((prev) => prev.filter((c) => c.id !== confirmDelete.id));
    setConfirmDelete({ open: false, id: null });
  }

  function changeStatus(caseId, newStatus) {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              case_status: newStatus,
              history: [
                ...(c.history || []),
                {
                  date: new Date().toISOString().slice(0, 10),
                  note: `Remarks changed to "${newStatus}".`,
                  actor: "Counselor",
                },
              ],
            }
          : c
      )
    );
  }

  function openMenu(event, caseItem) {
    setAnchorEl(event.currentTarget);
    setSelectedCaseForMenu(caseItem);
  }

  function closeMenu() {
    setAnchorEl(null);
    setSelectedCaseForMenu(null);
  }

  function openHistory(caseItem) {
    setHistoryModal({ open: true, caseItem });
  }

  function closeHistory() {
    setHistoryModal({ open: false, caseItem: null });
  }

  // ---- UI helper ----
  const statusChip = (status) => {
    const color =
      status === "Open"
        ? "default"
        : status === "In Progress"
        ? "primary"
        : status === "Resolved"
        ? "success"
        : "secondary";
    return <Chip label={status} size="small" color={color} />;
  };

  // ---- UI ----
  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>
        Guidance Case Records
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button startIcon={<Add />} variant="contained" onClick={openAdd}>
                Add Case
              </Button>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Filter by status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6} textAlign={{ xs: "left", md: "right" }}>
            <Typography variant="caption" color="text.secondary">
              Total cases: {cases.length} • Displaying: {filteredCases.length}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Case Type</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCases.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Typography variant="subtitle2">{c.student_first_name} {c.student_middle_name} {c.student_last_name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.student_no}
                  </Typography>
                </TableCell>
                <TableCell>{c.case_type}</TableCell>
                <TableCell>
                  <Typography noWrap sx={{ maxWidth: 320 }}>
                    {c.remarks}
                  </Typography>
                </TableCell>
                <TableCell>{`${c.first_name} ${c.middle_name} ${c.last_name}` || "Unassigned"}</TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={"space-between"}
                  >
                    {statusChip(c.case_status)}
                    <FormControl size="small">
                      <Select
                        value={c.case_status}
                        onChange={(e) => changeStatus(c.id, e.target.value)}
                        sx={{ minWidth: 120 }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </TableCell>
                <TableCell>{c.createdAt}</TableCell>
                <TableCell align="right">
                  <Tooltip title="More actions">
                    <IconButton onClick={(e) => openMenu(e, c)}>
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {filteredCases.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    No cases found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            openEdit(selectedCaseForMenu);
            closeMenu();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            openHistory(selectedCaseForMenu);
            closeMenu();
          }}
        >
          <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> View History
        </MenuItem>
        <MenuItem
          onClick={() => {
            askDelete(selectedCaseForMenu?.id);
            closeMenu();
          }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            const nextIndex =
              (STATUS_OPTIONS.indexOf(selectedCaseForMenu?.status || "Open") +
                1) %
              STATUS_OPTIONS.length;
            changeStatus(selectedCaseForMenu.id, STATUS_OPTIONS[nextIndex]);
            closeMenu();
          }}
        >
          <Autorenew fontSize="small" sx={{ mr: 1 }} /> Advance status
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openForm} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCase?.id ? "Edit Case" : "Add Case"}</DialogTitle>
        <DialogContent>
          {editingCase && (
            <Stack spacing={2} mt={1}>
              {/* Fill up appointment details first to initiate case record and assigned to specific counselor */}
              <TextField
                select
                fullWidth
                label="Student Name"
                value={formData.student_id}
                onChange={(e) => {
                  const selected = lookup.students.find((s) => s.id === e.target.value);

                  setFormData({
                    ...formData,
                    student_id: selected.id,
                    student_name: `${selected.first_name} ${selected.middle_name} ${selected.last_name}`,
                  });
                }}
              >
                {lookup.students.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.first_name} {s.middle_name} {s.last_name}
                  </MenuItem>
                ))}
              </TextField>


              <TextField
                label="Student ID"
                disabled
                value={
                  lookup.students.find((s) => s.id === formData.student_id)?.student_no || ""
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />


              <FormControl fullWidth>
                <InputLabel>Case Type</InputLabel>
                <Select
                  value={formData.case_type}
                  label="Case Type"
                  onChange={(e) =>
                    setFormData({ ...formData, case_type: e.target.value })
                  }
                >
                  {CASE_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Summary"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                select
                fullWidth
                label="Assigned Counselor"
                value={formData.assigned_to}
                onChange={(e) => {
                  const selected = lookup.counselors.find(
                    (c) =>
                      `${c.counselor_first_name} ${c.counselor_middle_name} ${c.counselor_last_name}` ===
                      e.target.value
                  );

                  setFormData({
                    ...formData,
                    assigned_to: e.target.value,
                    counselor_id: selected.counselor_id, // <-- store ID here
                  });
                }}
              >
                {lookup.counselors.map((s) => (
                  <MenuItem
                    key={s.counselor_id}
                    value={`${s.counselor_first_name} ${s.counselor_middle_name} ${s.counselor_last_name}`}
                  >
                    {s.counselor_first_name} {s.counselor_middle_name} {s.counselor_last_name}
                  </MenuItem>
                ))}
              </TextField>

              <FormControl fullWidth>
                <InputLabel>Remarks</InputLabel>
                <Select
                  value={formData.remarks}
                  label="Remarks"
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm}>Cancel</Button>
          <Button variant="contained" onClick={saveCase}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
      >
        <DialogTitle>Delete case?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this case? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, id: null })}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={confirmDeleteCase}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* History modal */}
      <Dialog
        open={historyModal.open}
        onClose={closeHistory}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Case History
          <Typography variant="subtitle2" color="text.secondary">
            {historyModal.caseItem?.studentName} •{" "}
            {historyModal.caseItem?.caseType}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {historyModal.caseItem ? (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Summary:</strong> {historyModal.caseItem.summary}
              </Typography>
              <List>
                {(historyModal.caseItem.history || []).map((h, idx) => (
                  <React.Fragment key={idx}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body2" fontWeight={600}>
                              {h.actor}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {h.date}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="body2">{h.note}</Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {(historyModal.caseItem.history || []).length === 0 && (
                  <ListItem>
                    <ListItemText primary="No history recorded." />
                  </ListItem>
                )}
              </List>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHistory}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuidanceCaseRecords;
