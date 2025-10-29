import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Grid,
  Modal,
  Tabs,
  Tab,
  Divider,
  TextField,
  Autocomplete,
} from "@mui/material";
import theme from "../../theme";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const Students = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openCase, setOpenCase] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [markSelectedStudents, setMarkSelectedStudents] = useState([]);

  console.log(markSelectedStudents, "mark selectedStudents");

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "/counselorManageStudentRoutes/counselor/student_lookup"
        );
        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data); // Initially, all students are displayed
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleInactiveStatus = async () => {
    try {
      const response = await fetch(
        `/counselorManageStudentRoutes/students/status/bulk`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentNos: markSelectedStudents,
            status: "Inactive",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update users");

      const result = await response.json();
      console.log("Users updated:", result);
      setMarkSelectedStudents([]);
    } catch (error) {
      console.error("Error updating users:", error);
    }
  };

  // Handlers
  const handleOpenProfile = (student) => {
    setSelectedStudent(student);
    setOpenProfile(true);
  };
  const handleCloseProfile = () => {
    setOpenProfile(false);
    setSelectedStudent(null);
    setTab(0);
  };
  const handleOpenCase = (student) => {
    setSelectedStudent(student);
    setOpenCase(true);
  };
  const handleCloseCase = () => {
    setOpenCase(false);
    setSelectedStudent(null);
  };

  const handleInactiveStudent = () => {
    setIsEditing((prev) => !prev); // toggles true <-> false
    setMarkSelectedStudents([]);
  };

  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // pushes items to edges
          p: 2, // optional padding
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          My Students
        </Typography>
        <Button
          onClick={handleInactiveStudent}
          variant="contained"
          color="primary"
        >
          SET INACTIVE STUDENTS
        </Button>
      </Box>

      {/* Autocomplete Search */}
      <Autocomplete
        options={students}
        getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
        onChange={(event, value) => {
          if (value) {
            setFilteredStudents([value]); // show only selected student
          } else {
            setFilteredStudents(students); // reset to all students
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Students"
            variant="outlined"
            sx={{ mb: 3 }}
          />
        )}
        clearOnEscape
      />
      {isEditing && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "rgba(33, 150, 243, 0.1)", // light info blue
            borderRadius: 2,
            p: 1.5,
            mb: 2,
          }}
        >
          <InfoOutlinedIcon color="info" fontSize="small" />
          <Typography color="info.main" fontSize="0.875rem">
            Click all students you want to make as inactive
          </Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        {filteredStudents && filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  border: markSelectedStudents.includes(student.student_no)
                    ? "2px solid rgba(255, 0, 0, 0.5)" // soft red
                    : "none",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setMarkSelectedStudents((prev) => {
                    if (prev.includes(student.student_no)) {
                      // remove from selected if already clicked
                      return prev.filter((id) => id !== student.student_no);
                    } else {
                      // add to selected
                      return [...prev, student.student_no];
                    }
                  });
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar>{student.first_name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {`${student.first_name} ${student.last_name}`}
                      </Typography>
                      <Chip
                        label={student.status}
                        size="small"
                        sx={{
                          mt: 0.5,
                          backgroundColor:
                            student.status === "Active"
                              ? theme.palette.primary.tertiary
                              : student.status === "On-hold"
                              ? theme.palette.primary.red
                              : theme.palette.grey[500],
                          color: "#fff",
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Last Session:{" "}
                    {student.last_appointment || "No Appointments yet"}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click
                        handleOpenCase(student);
                      }}
                      variant="contained"
                      size="small"
                    >
                      View Case
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click
                        handleOpenProfile(student);
                      }}
                      variant="outlined"
                      size="small"
                    >
                      View Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ py: 6 }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No students found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                It looks like there are no students to display right now.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Modals remain the same */}
      {isEditing && (
        <Button
          onClick={handleInactiveStatus}
          sx={{ mt: 3 }}
          variant="outlined"
        >
          SAVE CHANGES
        </Button>
      )}
    </Box>
  );
};

export default Students;
