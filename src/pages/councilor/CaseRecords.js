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

// Sample data for students
const students = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Alice Johnson" },
];

// Case types
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

// Session types
const sessionTypes = ["Online", "Meet-up"];

const CaseRecords = () => {
  const { user } = useRole();
  const [records, setRecords] = useState([]);
  const [quickNotes, setQuickNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    caseType: "",
    offense: "",
    sessionType: "",
    date: "",
    remarks: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaseType = (e) => {
    setFormData({ ...formData, caseType: e.target.value });
  };

  const handleSessionType = (e) => {
    setFormData({ ...formData, sessionType: e.target.value });
  };

  const handleAddQuickNote = () => {
    if (currentNote.trim() === "") return;
    setQuickNotes([...quickNotes, currentNote]);
    setCurrentNote("");
  };

  const handleSaveRecord = () => {
    if (!formData.studentId || !formData.caseType) return;

    const studentName = students.find(
      (s) => s.id === Number(formData.studentId)
    )?.name;

    setRecords([
      ...records,
      {
        id: records.length + 1,
        studentName,
        caseType: formData.caseType,
        offense: formData.offense,
        sessionType: formData.sessionType,
        date: formData.date,
        remarks: formData.remarks,
        quickNotes,
      },
    ]);

    // Reset form and quick notes
    setFormData({
      studentId: "",
      caseType: "",
      offense: "",
      sessionType: "",
      date: "",
      remarks: "",
    });
    setQuickNotes([]);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/students/list");

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();
        setStudents(data); // save students to state
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Student Case Records
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Case Record
        </Typography>

        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
          <TextField
            fullWidth
            select
            label="Select Student"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
          >
            {students.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Case Type"
            name="caseType"
            value={formData.caseType}
            onChange={handleCaseType}
          >
            {caseTypes.map((group) => [
              <MenuItem key={`label-${group.group}`} disabled sx={{ fontWeight: "bold" }}>
                {group.group}
              </MenuItem>,
              group.items.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              )),
            ])}
          </TextField>



          <TextField
            fullWidth
            label="Concern / Offense"
            name="offense"
            value={formData.offense}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            select
            label="Session Type"
            name="sessionType"
            value={formData.sessionType}
            onChange={handleSessionType}
          >
            {sessionTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
          />

          {/* Quick Notes Section */}
          <Box>
            <TextField
              fullWidth
              label="Quick Note (during appointment)"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddQuickNote();
                }
              }}
            />
            <Button
              sx={{ mt: 1 }}
              variant="outlined"
              onClick={handleAddQuickNote}
            >
              Add Quick Note
            </Button>

            {quickNotes.length > 0 && (
              <Paper sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5" }}>
                <Typography variant="subtitle2">Quick Notes:</Typography>
                <List>
                  {quickNotes.map((note, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`- ${note}`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>

          <Button sx={{ mt: 2 }} variant="contained" onClick={handleSaveRecord}>
            Save Case Record
          </Button>
        </Box>
      </Paper>

      {/* Display Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Case Records List
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Case Type</TableCell>
              <TableCell>Concern / Offense</TableCell>
              <TableCell>Session Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Quick Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.studentName}</TableCell>
                <TableCell>{r.caseType}</TableCell>
                <TableCell>{r.offense}</TableCell>
                <TableCell>{r.sessionType}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.remarks}</TableCell>
                <TableCell>
                  <List dense>
                    {r.quickNotes.map((note, i) => (
                      <ListItem key={i} sx={{ py: 0 }}>
                        <ListItemText primary={`- ${note}`} />
                      </ListItem>
                    ))}
                  </List>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default CaseRecords;
