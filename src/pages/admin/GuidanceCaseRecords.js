import React, { useState, useMemo } from "react";
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
const defaultCases = [
  {
    id: 1,
    studentName: "Juan Dela Cruz",
    studentId: "STU-001",
    caseType: "Academic",
    summary: "Falling behind in Math",
    assignedTo: "Ms. Santos",
    status: "Open",
    createdAt: "2025-09-20",
    history: [
      {
        date: "2025-09-20",
        note: "Initial intake. Referred to subject teacher.",
        actor: "Ms. Santos",
      },
    ],
  },
  {
    id: 2,
    studentName: "Maria Clara",
    studentId: "STU-002",
    caseType: "Behavioral",
    summary: "Frequent classroom disruptions",
    assignedTo: "Mr. Reyes",
    status: "In Progress",
    createdAt: "2025-09-18",
    history: [
      {
        date: "2025-09-18",
        note: "Meeting with student. Behaviour plan drafted.",
        actor: "Mr. Reyes",
      },
      {
        date: "2025-09-23",
        note: "Follow-up. Some improvement observed.",
        actor: "Mr. Reyes",
      },
    ],
  },
];

const CASE_TYPES = ["Academic", "Personal", "Behavioral"];
const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"];

const GuidanceCaseRecords = () => {
  const [cases, setCases] = useState(defaultCases);
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

  const filteredCases = useMemo(() => {
    if (filterStatus === "All") return cases;
    return cases.filter((c) => c.status === filterStatus);
  }, [cases, filterStatus]);

  // ---- Handlers ----
  function openAdd() {
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
    if (!editingCase.studentName?.trim() || !editingCase.summary?.trim()) {
      alert("Please fill student name and summary.");
      return;
    }

    if (editingCase.id) {
      setCases((prev) =>
        prev.map((c) => (c.id === editingCase.id ? { ...editingCase } : c))
      );
    } else {
      const newCase = {
        ...editingCase,
        id: Math.max(0, ...cases.map((c) => c.id)) + 1,
        createdAt: new Date().toISOString().slice(0, 10),
        history: [
          {
            date: new Date().toISOString().slice(0, 10),
            note: "Case created.",
            actor: editingCase.assignedTo || "System",
          },
        ],
      };
      setCases((prev) => [newCase, ...prev]);
    }
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
              status: newStatus,
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
                  <Typography variant="subtitle2">{c.studentName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.studentId}
                  </Typography>
                </TableCell>
                <TableCell>{c.caseType}</TableCell>
                <TableCell>
                  <Typography noWrap sx={{ maxWidth: 320 }}>
                    {c.summary}
                  </Typography>
                </TableCell>
                <TableCell>{c.assignedTo || "Unassigned"}</TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={"space-between"}
                  >
                    {statusChip(c.status)}
                    <FormControl size="small">
                      <Select
                        value={c.status}
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
              <TextField
                label="Student Name"
                value={editingCase.studentName}
                onChange={(e) =>
                  setEditingCase({
                    ...editingCase,
                    studentName: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="Student ID"
                value={editingCase.studentId}
                onChange={(e) =>
                  setEditingCase({ ...editingCase, studentId: e.target.value })
                }
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Case Type</InputLabel>
                <Select
                  value={editingCase.caseType}
                  label="Case Type"
                  onChange={(e) =>
                    setEditingCase({ ...editingCase, caseType: e.target.value })
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
                value={editingCase.summary}
                onChange={(e) =>
                  setEditingCase({ ...editingCase, summary: e.target.value })
                }
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                label="Assigned Counselor"
                value={editingCase.assignedTo}
                onChange={(e) =>
                  setEditingCase({ ...editingCase, assignedTo: e.target.value })
                }
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Remarks</InputLabel>
                <Select
                  value={editingCase.status}
                  label="Remarks"
                  onChange={(e) =>
                    setEditingCase({ ...editingCase, status: e.target.value })
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
