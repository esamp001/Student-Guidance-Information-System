import React, { useEffect, useState } from "react";
import { useRole } from "../../context/RoleContext";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import useSnackbar from "../../hooks/useSnackbar";

const caseTypes = [
  {
    group: "Academic Counseling",
    items: [
      "Low Academic Performance",
      "Study Habits / Time Management",
      "Absenteeism",
      "Learning Difficulties",
    ],
  },
  {
    group: "Behavioral Support",
    items: [
      "Disciplinary Case",
      "Bullying / Peer Conflict",
      "Emotional / Mental Health Concern",
      "Substance-Related Concern",
      "Family-Related Issue",
    ],
  },
  {
    group: "Career Guidance",
    items: [
      "Course / Strand Selection",
      "Career Planning",
      "Work Readiness / Internship",
      "Vocational Testing / Interest Assessment",
    ],
  },
];

const sessionTypes = ["Online", "Meet-up"];

const CaseRecords = () => {
  const { user } = useRole();
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [quickNotes, setQuickNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [quickNotesData, setQuickNotesData] = useState([]); // ← THIS IS THE KEY
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const [formData, setFormData] = useState({
    studentId: "",
    caseType: "",
    offense: "",
    sessionType: "",
    date: "",
    remarks: "",
  });

  // FETCH BOTH RECORDS + QUICK NOTES
  const fetchAllData = async () => {
    try {
      const res = await fetch("/caseRecordsCounselor/AllCaseRecords");
      if (!res.ok) throw new Error();
      const data = await res.json();

      setRecords(data.caseRecords || []);
      setQuickNotesData(data.quickNotes || []); // ← LOAD QUICK NOTES HERE
    } catch (err) {
      setRecords([]);
      setQuickNotesData([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/caseRecordsCounselor/student_lookup");
      if (res.ok) setStudents(await res.json());
    } catch (err) {
      console.error("Students failed", err);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchStudents();
    fetchAllData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddQuickNote = () => {
    if (!currentNote.trim()) return;
    setQuickNotes([...quickNotes, currentNote.trim()]);
    setCurrentNote("");
  };

  const handleSaveRecord = async () => {
    if (!user?.id) return showSnackbar("Login required", "error");

    try {
      const res = await fetch("/caseRecordsCounselor/case-records/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          counselorId: user.id,
          quickNotes,
        }),
      });

      if (res.ok) {
        // REFRESH EVERYTHING — THIS IS THE MAGIC
        await fetchAllData();

        showSnackbar("Saved! Notes updated.", "success");

        // Reset form
        setFormData({
          studentId: "",
          caseType: "",
          offense: "",
          sessionType: "",
          date: "",
          remarks: "",
        });
        setQuickNotes([]);
        setCurrentNote("");
      } else {
        throw new Error();
      }
    } catch (err) {
      showSnackbar("Save failed", "error");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Student Case Records
      </Typography>

      {/* FORM */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Record
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Student"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            fullWidth
          >
            {students.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.first_name} {s.last_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Case Type"
            name="caseType"
            value={formData.caseType}
            onChange={handleChange}
            fullWidth
          >
            {caseTypes.flatMap((group) => [
              <MenuItem key={group.group} disabled sx={{ fontWeight: "bold" }}>
                {group.group}
              </MenuItem>,
              ...group.items.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              )),
            ])}
          </TextField>

          <TextField
            label="Concern / Offense"
            name="offense"
            value={formData.offense}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Session Type"
            name="sessionType"
            value={formData.sessionType}
            onChange={handleChange}
            fullWidth
          >
            {sessionTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          {/* QUICK NOTES INPUT */}
          <Box>
            <TextField
              fullWidth
              label="Quick Note"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddQuickNote())
              }
            />
            <Button
              sx={{ mt: 1 }}
              variant="outlined"
              onClick={handleAddQuickNote}
            >
              Add Note
            </Button>
            {quickNotes.length > 0 && (
              <Paper sx={{ mt: 2, p: 2, bgcolor: "#f0f0f0" }}>
                <Typography variant="subtitle2">Notes to save:</Typography>
                <List dense>
                  {quickNotes.map((note, i) => (
                    <ListItem key={i}>
                      <ListItemText primary={`• ${note}`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>

          <Button variant="contained" onClick={handleSaveRecord} sx={{ mt: 2 }}>
            Save Record
          </Button>
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Case Records List
        </Typography>
        <Table sx={{ border: "1px solid #ddd" }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Student</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
              <TableCell>
                <strong>Concern</strong>
              </TableCell>
              <TableCell>
                <strong>Session</strong>
              </TableCell>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell>
                <strong>Remarks</strong>
              </TableCell>
              <TableCell>
                <strong>Quick Notes</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <em>No records yet.</em>
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => {
                // FILTER NOTES FOR THIS RECORD
                const notes = quickNotesData
                  .filter((n) => n.case_record_id === r.id)
                  .map((n) => n.name);

                return (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>
                      {r.first_name} {r.middle_name || ""} {r.last_name}
                    </TableCell>
                    <TableCell>{r.case_type}</TableCell>
                    <TableCell>{r.offense}</TableCell>
                    <TableCell>{r.session_type}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.remarks || "-"}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      {notes.length > 0 ? (
                        <List dense sx={{ py: 0 }}>
                          {notes.slice(0, 3).map((note, i) => (
                            <ListItem key={i} sx={{ py: 0 }}>
                              <ListItemText primary={`• ${note}`} />
                            </ListItem>
                          ))}
                          {notes.length > 3 && (
                            <ListItem sx={{ py: 0 }}>
                              <ListItemText
                                primary={`... +${notes.length - 3} more`}
                              />
                            </ListItem>
                          )}
                        </List>
                      ) : (
                        <em style={{ color: "#999", fontSize: "0.85rem" }}>
                          No notes
                        </em>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {SnackbarComponent}
    </Box>
  );
};

export default CaseRecords;
