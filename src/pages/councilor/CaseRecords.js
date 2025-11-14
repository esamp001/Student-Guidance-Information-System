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
  const [appointments, setAppointments] = useState([]);

  const [formData, setFormData] = useState({
    studentId: "",
    caseType: "",
    offense: "",
    sessionType: "",
    appointmentId: "",
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

  // FETCH APPOINTMENTS
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/caseRecordsCounselor/appointments");
        if (res.ok) {
          const data = await res.json();
          console.log(data, "data");
          setAppointments(data);
        }
      } catch (err) {
        console.error("Appointments failed", err);
      }
    };
    fetchAppointments();
  }, []);


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
    const { name, value } = e.target;

    // Check if appointment is being selected
    if (name === "appointmentId") {
      const selectedAppointment = appointments.find((a) => a.id === value);
      console.log(selectedAppointment, "selectedAppointment");
      if (selectedAppointment) {
        setFormData({
          ...formData,
          appointmentId: value,
          studentId: selectedAppointment.student_id,
          sessionType: selectedAppointment.mode || "",   // populate sessionType
          offense: selectedAppointment.reason || "", // populate reason
        });
        return; // exit early
      }
    }

    // Default update for other fields
    setFormData({ ...formData, [name]: value });
  };


  const handleAddQuickNote = () => {
    if (!currentNote.trim()) return;
    setQuickNotes([...quickNotes, currentNote.trim()]);
    setCurrentNote("");
  };

  const handleSaveRecord = async () => {
    if (!user?.id) return showSnackbar("Login required", "error");

    try {
      const res = await fetch(`/caseRecordsCounselor/case-records/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quickNotes,
          user_id: user.id, // <- add this
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

          {/* Select the appointment to populate other data */}
          <TextField
            select
            label="Appointment"
            name="appointmentId"
            value={formData.appointmentId}
            onChange={handleChange}
            fullWidth
          >
            {appointments.map((a) => (
              <MenuItem key={a.id} value={a.id} sx={{ py: 1.5, px: 2 }}>
                <Box display="flex" flexDirection="column">
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {a.type} ({a.mode})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.3 }}>
                    Reason: {a.reason}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Student: {a.first_name} {a.last_name}
                  </Typography>
                </Box>
              </MenuItem>
            ))}

          </TextField>

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
                {s.first_name} {s.middle_name} {s.last_name}
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
            {/* Academic-Related Cases */}
            <MenuItem value="Academic Difficulty">Academic Difficulty</MenuItem>
            <MenuItem value="Low Academic Performance">Low Academic Performance</MenuItem>
            <MenuItem value="Chronic Absenteeism / Attendance Concern">
              Chronic Absenteeism / Attendance Concern
            </MenuItem>
            <MenuItem value="Identified Learning Difficulty">
              Identified Learning Difficulty
            </MenuItem>
            <MenuItem value="Academic At-Risk Case">Academic At-Risk Case</MenuItem>

            {/* Personal / Emotional Cases */}
            <MenuItem value="Emotional Distress">Emotional Distress</MenuItem>
            <MenuItem value="Stress or Anxiety Case">Stress or Anxiety Case</MenuItem>
            <MenuItem value="Self-Esteem Issue">Self-Esteem Issue</MenuItem>
            <MenuItem value="Adjustment Difficulty">Adjustment Difficulty</MenuItem>
            <MenuItem value="Personal Crisis Case">Personal Crisis Case</MenuItem>

            {/* Behavioral & Disciplinary Cases */}
            <MenuItem value="Minor Misconduct">Minor Misconduct</MenuItem>
            <MenuItem value="Major Misconduct">Major Misconduct</MenuItem>
            <MenuItem value="Classroom Misbehavior">Classroom Misbehavior</MenuItem>
            <MenuItem value="Violation of School Rules">Violation of School Rules</MenuItem>
            <MenuItem value="Repeated Behavioral Offense">
              Repeated Behavioral Offense
            </MenuItem>

            {/* Peer & Social Cases */}
            <MenuItem value="Peer Conflict">Peer Conflict</MenuItem>
            <MenuItem value="Bullying (Victim)">Bullying (Victim)</MenuItem>
            <MenuItem value="Bullying (Offender)">Bullying (Offender)</MenuItem>
            <MenuItem value="Social Relationship Issue">Social Relationship Issue</MenuItem>
            <MenuItem value="Interpersonal Conflict">Interpersonal Conflict</MenuItem>

            {/* Family-Related Cases */}
            <MenuItem value="Family Conflict">Family Conflict</MenuItem>
            <MenuItem value="Parental Concern">Parental Concern</MenuItem>
            <MenuItem value="Home Environment Issue">Home Environment Issue</MenuItem>

            {/* Career-Related Cases */}
            <MenuItem value="Career Concern">Career Concern</MenuItem>
            <MenuItem value="Course Misalignment Case">Course Misalignment Case</MenuItem>
            <MenuItem value="Work Readiness Issue">Work Readiness Issue</MenuItem>

            {/* Crisis Cases */}
            <MenuItem value="Crisis Intervention Case">Crisis Intervention Case</MenuItem>
            <MenuItem value="High-Risk Behavior">High-Risk Behavior</MenuItem>
            <MenuItem value="Safety Concern">Safety Concern</MenuItem>

            {/* Referral Cases */}
            <MenuItem value="Referred to Psychologist">Referred to Psychologist</MenuItem>
            <MenuItem value="Referred to External Agency">Referred to External Agency</MenuItem>
            <MenuItem value="Referred to Teacher/Department">
              Referred to Teacher/Department
            </MenuItem>
          </TextField>

          <TextField
            label="Appointment Reason / Concern"
            name="offense"
            value={formData.offense}
            onChange={handleChange}
            fullWidth
          />
          
          <TextField
            label="Session Type"
            name="sessionType"
            value={formData.sessionType}
            onChange={handleChange}
            fullWidth
          />

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
