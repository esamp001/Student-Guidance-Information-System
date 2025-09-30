import React, { useState } from "react";
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
  const [tab, setTab] = useState(0);

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

  const students = [
    { name: "Alice Johnson", status: "Active", lastSession: "Jun 10, 2024" },
    { name: "Bob Williams", status: "On-hold", lastSession: "May 30, 2024" },
    { name: "Charlie Davis", status: "Active", lastSession: "Jun 14, 2024" },
    { name: "Diana Miller", status: "Active", lastSession: "Jun 12, 2024" },
    { name: "Ethan White", status: "Inactive", lastSession: "Apr 20, 2024" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        My Students
      </Typography>

      <Grid container spacing={4}>
        {students.map((student, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar>{student.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {student.name}
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
                  Last Session: {student.lastSession}
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
        ))}
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
                  Student Profile: {selectedStudent.name}
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
                <Box>
                  <Typography>Name: {selectedStudent.name}</Typography>
                  <Typography>Status: {selectedStudent.status}</Typography>
                  <Typography>
                    Last Session: {selectedStudent.lastSession}
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
