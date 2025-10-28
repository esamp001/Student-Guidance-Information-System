import React, { useEffect, useState } from "react";
import theme from "../../theme";
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
} from "@mui/material";

const Students = () => {
  // State for Profile Modal
  const [openProfile, setOpenProfile] = useState(false);
  const [openCase, setOpenCase] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  console.log(selectedStudent, "selected student");
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

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

  // const students = [
  //   { name: "Alice Johnson", status: "Active", lastSession: "Jun 10, 2024" },
  //   { name: "Bob Williams", status: "On-hold", lastSession: "May 30, 2024" },
  //   { name: "Charlie Davis", status: "Active", lastSession: "Jun 14, 2024" },
  //   { name: "Diana Miller", status: "Active", lastSession: "Jun 12, 2024" },
  //   { name: "Ethan White", status: "Inactive", lastSession: "Apr 20, 2024" },
  // ];

  // All students look up
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "/counselorManageStudentRoutes/counselor/student_lookup"
        );
        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        border: "1px solid red",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={3}>
        My Students
      </Typography>

      <Grid container spacing={4}>
        {students && students.length > 0 ? (
          students.map((student, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
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
                    {student.last_appointment
                      ? student.last_appointment
                      : "No Appointments yet"}
                  </Typography>

                  <Box display="flex" gap={1}>
                    <Button
                      onClick={() => handleOpenCase(student)}
                      variant="contained"
                      size="small"
                    >
                      View Case
                    </Button>
                    <Button
                      onClick={() => handleOpenProfile(student)}
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
              sx={{
                py: 6,
                border: "1px solid",
              }}
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

      {/* Profile Modal */}
      <Modal open={openProfile} onClose={handleCloseProfile}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {selectedStudent && (
            <>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  Student Profile: {selectedStudent.first_name}
                </Typography>
                <Button
                  onClick={handleCloseProfile}
                  variant="outlined"
                  size="small"
                >
                  Close
                </Button>
              </Box>

              {/* Tabs */}
              <Tabs
                value={tab}
                onChange={(e, val) => setTab(val)}
                sx={{ mb: 2 }}
              >
                <Tab label="Personal Details" />
                <Tab label="Academic Records" />
                <Tab label="Behavioral History" />
              </Tabs>

              <Divider sx={{ mb: 2 }} />

              {tab === 0 && (
                <Box
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Student Details
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    <strong>Student ID:</strong> {selectedStudent[0].student_no}
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    <strong>Name:</strong> {selectedStudent[0].first_name}
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    <strong>Status:</strong>{" "}
                    <Chip
                      label={selectedStudent[0].status}
                      size="small"
                      sx={{
                        backgroundColor:
                          selectedStudent[0].status === "Active"
                            ? "success.main"
                            : selectedStudent[0].status === "On-hold"
                            ? "warning.main"
                            : "grey.500",
                        color: "#fff",
                        fontWeight: 500,
                      }}
                    />
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    <strong>Last Session:</strong>{" "}
                    {selectedStudent[0].last_appointment
                      ? selectedStudent[0].last_appointment
                      : "No Appointment yet"}
                  </Typography>
                </Box>
              )}
              {tab === 1 && <Typography> Academic Records...</Typography>}
              {tab === 2 && <Typography>Behavioral History...</Typography>}
            </>
          )}
        </Box>
      </Modal>

      {/* Case Modal */}
      <Modal open={openCase} onClose={handleCloseCase}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {selectedStudent && (
            <>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  Case Details: {selectedStudent.name}
                </Typography>
                <Button
                  onClick={handleCloseCase}
                  variant="outlined"
                  size="small"
                >
                  Close
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" mb={2}>
                Case notes and history for {selectedStudent.name} will be
                displayed here.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Example: Last counseling session was on{" "}
                {selectedStudent.lastSession}.
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Students;
