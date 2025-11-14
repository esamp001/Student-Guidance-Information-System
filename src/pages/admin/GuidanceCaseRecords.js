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
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  History as HistoryIcon,
  Autorenew,
  CheckCircle,
  Schedule,
  Cancel,
  Event,
} from "@mui/icons-material";
import useSnackbar from "../../hooks/useSnackbar";

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
  const { showSnackbar } = useSnackbar();
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

  const [appointmentProgress, setAppointmentProgress] = useState({
    loading: false,
    appointments: [],
    total: 0,
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
    remarks: "",
  });

  console.log(formData, "formData");

  // API - Auto create guidance case records
  useEffect(() => {
    const fetchAndCreateCases = async () => {
      try {
        // Fetch the lookup data
        const response = await fetch(
          "/adminGuidanceCaseRecords/admin/students/lookup"
        );
        const data = await response.json();

        // Automatically create guidance case records
        for (const record of data) {
          // Example payload — adjust fields to match your backend
          const payload = {
            appointment_id: record.appointment_id,
            student_id: record.student_id,
            counselor_id: record.counselor_id,
            case_type: record.case_type || "student_initiated",
            status: record.status,
            summary: record.remarks || "",
            remarks: record.case_status || "",
          };

          await fetch("/adminGuidanceCaseRecords/guidanceCaseRecords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } catch (error) {
        console.error("Error fetching or creating cases:", error);
      }
    };

    fetchAndCreateCases();
  }, []);

  // Api get display to table once the case is created by counselor
  useEffect(() => {
    const fetchDisplayToTable = async () => {
      try {
        const response = await fetch(
          "/adminGuidanceCaseRecords/guidanceCaseRecords/display_to_table"
        );
        const data = await response.json();
        console.log(data, "data");
        // Ensure data is an array before setting state
        setCases(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching display to table:", error);
        setCases([]);
      }
    };
    fetchDisplayToTable();
  }, []);

  // API - Look up for case to be auto filled on form
  const fetchLookupForm = async () => {
    try {
      const response = await fetch(
        "/adminGuidanceCaseRecords/students/counselor/lookup"
      );
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

  // const changeStatus = async (id, newStatus) => {
  //   try {
  //     // optional: optimistic UI update
  //     setCases((prev) =>
  //       prev.map((c) => (c.id === id ? { ...c, remarks: newStatus } : c))
  //     );

  //     // send update to backend
  //     await fetch(`/guidanceCaseRecords/update/${id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ remarks: newStatus }),
  //     });

  //     // or refetch after success (optional)
  //     // fetchCases();
  //   } catch (error) {
  //     console.error("Failed to update status:", error);
  //   }
  // };

  // API - Handle Edit for both counselor and student initiated case records
  const filteredCases = useMemo(() => {
    if (!Array.isArray(cases) || cases.length === 0) return [];
    if (filterStatus === "All") return cases;
    return cases.filter((c) => c.status === filterStatus);
  }, [cases, filterStatus]);

  // ---- Handlers ----
  function openAdd() {
    fetchLookupForm();
    setFormData({
      student_name: "",
      student_id: "",
      appointment_id: "",
      case_type: "",
      summary: "",
      assigned_to: "",
      counselor_id: "",
      remarks: "",
    });
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
    setFormData({
      student_name: "",
      student_id: "",
      appointment_id: "",
      case_type: "",
      summary: "",
      assigned_to: "",
      counselor_id: "",
      remarks: "",
    });
    setOpenForm(false);
  }

  function saveCase() {
    if (!formData.student_id || !formData.summary?.trim()) {
      alert("Please select a student and enter a summary.");
      return;
    }
    if (!formData.counselor_id) {
      alert("Please select an assigned counselor.");
      return;
    }

    const handleSaveCase = async () => {
      try {
        const response = await fetch("/adminGuidanceCaseRecords/saveCase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            appointment_id: null,
          }),
        });

        if (response.ok) {
          const newCase = await response.json(); // get saved record from backend
          showSnackbar("Case saved successfully", "success");

          // Update the local UI immediately
          setCases((prev) => [newCase, ...(Array.isArray(prev) ? prev : [])]); // prepend new record

          closeForm();
        } else {
          showSnackbar("Failed to save case", "error");
        }
      } catch (err) {
        console.error("Error saving case:", err);
        showSnackbar("Error saving case", "error");
      }
    };

    handleSaveCase();
  }

  function askDelete(caseId) {
    setConfirmDelete({ open: true, id: caseId });
  }

  function confirmDeleteCase() {
    setCases((prev) =>
      Array.isArray(prev) ? prev.filter((c) => c.id !== confirmDelete.id) : []
    );
    setConfirmDelete({ open: false, id: null });
  }

  const changeStatus = async (id, newStatus) => {
    try {
      // optional: optimistic UI update
      setCases((prev) =>
        Array.isArray(prev)
          ? prev.map((c) => (c.id === id ? { ...c, remarks: newStatus } : c))
          : []
      );

      // send update to backend
      await fetch(
        `/adminGuidanceCaseRecords/guidanceCaseRecords/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remarks: newStatus }),
        }
      );

      showSnackbar("Status updated successfully", "success");

      // or refetch after success (optional)
      // fetchCases();
    } catch (error) {
      console.error("Failed to update status:", error);
      showSnackbar("Failed to update status", "error");
    }
  };

  function openMenu(event, caseItem) {
    setAnchorEl(event.currentTarget);
    setSelectedCaseForMenu(caseItem);
  }

  function closeMenu() {
    setAnchorEl(null);
    setSelectedCaseForMenu(null);
  }

  const openHistory = async (caseItem) => {
    setHistoryModal({ open: true, caseItem });
    setAppointmentProgress({ loading: true, appointments: [], total: 0 });

    try {
      const response = await fetch(
        `/adminGuidanceCaseRecords/guidanceCaseRecords/${caseItem.id}/appointments-progress`
      );

      if (response.ok) {
        const data = await response.json();
        setAppointmentProgress({
          loading: false,
          appointments: data.appointments || [],
          total: data.total_appointments || 0,
        });
      } else {
        console.error("Failed to fetch appointment progress");
        setAppointmentProgress({ loading: false, appointments: [], total: 0 });
      }
    } catch (error) {
      console.error("Error fetching appointment progress:", error);
      setAppointmentProgress({ loading: false, appointments: [], total: 0 });
    }
  };

  function closeHistory() {
    setHistoryModal({ open: false, caseItem: null });
    setAppointmentProgress({ loading: false, appointments: [], total: 0 });
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
              Total cases: {cases?.length || 0} • Displaying:{" "}
              {filteredCases?.length || 0}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Appointment Case Type</TableCell>
              <TableCell>Appointment Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(filteredCases || []).map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {c.first_name} {c.middle_name} {c.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.student_no}
                  </Typography>
                </TableCell>
                <TableCell>{c.case_type}</TableCell>
                <TableCell>
                  <Typography noWrap sx={{ maxWidth: 320 }}>
                    {c.appointment_status || "Unassigned"}
                  </Typography>
                </TableCell>
                <TableCell>
                  {`${c.counselor_first_name} ${c.counselor_middle_name} ${c.counselor_last_name}` ||
                    "Unassigned"}
                </TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={"space-between"}
                  >
                    {statusChip(c.remarks)}
                    <FormControl size="small">
                      <Select
                        value={c.remarks}
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
                <TableCell>{c.created_at}</TableCell>
                <TableCell align="right">
                  <Tooltip title="More actions">
                    <IconButton onClick={(e) => openMenu(e, c)}>
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {(!filteredCases || filteredCases.length === 0) && (
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
              <TextField
                select
                fullWidth
                label="Student Name"
                value={formData.student_id}
                onChange={(e) => {
                  const selected = lookup.students.find(
                    (s) => s.id === e.target.value
                  );

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
                  lookup.students.find((s) => s.id === formData.student_id)
                    ?.student_no || ""
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
                    {s.counselor_first_name} {s.counselor_middle_name}{" "}
                    {s.counselor_last_name}
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

      {/* History modal - Appointment Progress */}
      <Dialog
        open={historyModal.open}
        onClose={closeHistory}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryIcon />
            <Box>
              <Typography variant="h6">Appointment Progress</Typography>
              <Typography variant="caption" color="text.secondary">
                {historyModal.caseItem?.first_name}{" "}
                {historyModal.caseItem?.middle_name}{" "}
                {historyModal.caseItem?.last_name} •{" "}
                {historyModal.caseItem?.case_type}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {appointmentProgress.loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Case Summary */}
              {historyModal.caseItem && (
                <Card sx={{ mb: 3, bgcolor: "grey.50" }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      <strong>Case Summary</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {historyModal.caseItem.summary || "No summary provided"}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      Total Appointments:{" "}
                      <strong>{appointmentProgress.total}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Appointment Timeline */}
              {appointmentProgress.appointments.length > 0 ? (
                <List sx={{ width: "100%" }}>
                  {appointmentProgress.appointments.map((appt, idx) => {
                    // Determine status icon and color
                    const getStatusConfig = (status) => {
                      switch (status) {
                        case "Completed":
                          return {
                            icon: <CheckCircle />,
                            color: "success.main",
                            bgColor: "success.light",
                          };
                        case "Confirmed":
                        case "Confirmed Reschedule":
                          return {
                            icon: <Event />,
                            color: "info.main",
                            bgColor: "info.light",
                          };
                        case "Rejected":
                        case "Cancelled":
                          return {
                            icon: <Cancel />,
                            color: "error.main",
                            bgColor: "error.light",
                          };
                        default:
                          return {
                            icon: <Schedule />,
                            color: "warning.main",
                            bgColor: "warning.light",
                          };
                      }
                    };

                    const statusConfig = getStatusConfig(appt.status);

                    return (
                      <React.Fragment key={appt.appointment_id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 2,
                            mb: 2,
                            bgcolor: "background.paper",
                          }}
                        >
                          {/* Timeline indicator */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              mr: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                bgcolor: statusConfig.bgColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: statusConfig.color,
                              }}
                            >
                              {statusConfig.icon}
                            </Box>
                            {idx <
                              appointmentProgress.appointments.length - 1 && (
                              <Box
                                sx={{
                                  width: 2,
                                  height: 40,
                                  bgcolor: "divider",
                                  mt: 1,
                                }}
                              />
                            )}
                          </Box>

                          {/* Appointment Details */}
                          <ListItemText
                            primary={
                              <Stack spacing={1}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                  >
                                    {appt.type} - {appt.mode}
                                  </Typography>
                                  <Chip
                                    label={appt.status}
                                    size="small"
                                    sx={{
                                      bgcolor: statusConfig.bgColor,
                                      color: statusConfig.color,
                                      fontWeight: 600,
                                    }}
                                  />
                                </Stack>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Date:</strong>{" "}
                                  {appt.datetime_formatted}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Counselor:</strong>{" "}
                                  {appt.counselor_name || "Unassigned"}
                                </Typography>
                              </Stack>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  <strong>Reason:</strong> {appt.reason}
                                </Typography>

                                {/* Status Change History */}
                                {appt.status_history &&
                                  appt.status_history.length > 0 && (
                                    <Card
                                      sx={{
                                        bgcolor: "info.lighter",
                                        mt: 1,
                                        mb: 1,
                                      }}
                                    >
                                      <CardContent
                                        sx={{
                                          py: 1,
                                          "&:last-child": { pb: 1 },
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          fontWeight={600}
                                          display="block"
                                          sx={{ mb: 0.5 }}
                                        >
                                          Status Timeline:
                                        </Typography>
                                        {appt.status_history.map(
                                          (history, hIdx) => (
                                            <Box
                                              key={hIdx}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                mb: 0.5,
                                              }}
                                            >
                                              <Chip
                                                label={
                                                  history.old_status ||
                                                  "Created"
                                                }
                                                size="small"
                                                sx={{
                                                  fontSize: "0.65rem",
                                                  height: 18,
                                                }}
                                              />
                                              <Typography variant="caption">
                                                →
                                              </Typography>
                                              <Chip
                                                label={history.new_status}
                                                size="small"
                                                color="primary"
                                                sx={{
                                                  fontSize: "0.65rem",
                                                  height: 18,
                                                }}
                                              />
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ ml: 0.5 }}
                                              >
                                                ({history.changed_at})
                                              </Typography>
                                            </Box>
                                          )
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}

                                {appt.session_notes && (
                                  <Card sx={{ bgcolor: "grey.50", mt: 1 }}>
                                    <CardContent
                                      sx={{ py: 1, "&:last-child": { pb: 1 } }}
                                    >
                                      <Typography
                                        variant="caption"
                                        fontWeight={600}
                                        display="block"
                                      >
                                        Session Notes:
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        display="block"
                                      >
                                        Type: {appt.session_notes.case_type}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        display="block"
                                      >
                                        Session:{" "}
                                        {appt.session_notes.session_type}
                                      </Typography>
                                      {appt.session_notes.remarks && (
                                        <Typography
                                          variant="caption"
                                          display="block"
                                        >
                                          Remarks: {appt.session_notes.remarks}
                                        </Typography>
                                      )}
                                    </CardContent>
                                  </Card>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No appointment history found for this student.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHistory}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuidanceCaseRecords;
