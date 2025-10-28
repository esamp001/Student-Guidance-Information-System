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
                height: "40vh", // centers vertically only this box
                textAlign: "center",
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
    </Box>
  );
};

export default Students;
