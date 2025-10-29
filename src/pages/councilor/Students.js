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

  const handleStatus = async () => {
    try {
      // Determine the new status based on the first selected student's current status
      const firstStudent = students.find((s) =>
        markSelectedStudents.includes(s.student_no)
      );

      if (!firstStudent) return; // no student selected

      const newStatus =
        firstStudent.status === "Active" ? "Inactive" : "Active";

      const response = await fetch(
        `/counselorManageStudentRoutes/students/status/bulk`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentNos: markSelectedStudents,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update users");

      const result = await response.json();
      console.log("Users updated:", result);

      // ✅ Update local state immediately to reflect the new status
      setStudents((prev) =>
        prev.map((student) =>
          markSelectedStudents.includes(student.student_no)
            ? { ...student, status: newStatus }
            : student
        )
      );

      // ✅ Also update filteredStudents if you’re using search
      setFilteredStudents((prev) =>
        prev.map((student) =>
          markSelectedStudents.includes(student.student_no)
            ? { ...student, status: newStatus }
            : student
        )
      );

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
          SET ACTIVE/INACTIVE STUDENTS
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
            Click all students you want to make as active/inactive
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
                    ? `2px solid ${theme.palette.primary.main}` // use theme primary color
                    : "none",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (isEditing) {
                    setMarkSelectedStudents((prev) => {
                      if (prev.includes(student.student_no)) {
                        // remove from selected if already clicked
                        return prev.filter((id) => id !== student.student_no);
                      } else {
                        // add to selected
                        return [...prev, student.student_no];
                      }
                    });
                  }
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
                    <strong>Student ID:</strong> {selectedStudent.student_no}
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    <strong>Name:</strong> {selectedStudent.first_name}
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    <strong>Status:</strong>{" "}
                    <Chip
                      label={selectedStudent.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          selectedStudent.status === "Active"
                            ? "success.main"
                            : selectedStudent.status === "On-hold"
                            ? "warning.main"
                            : "grey.500",
                        color: "#fff",
                        fontWeight: 500,
                      }}
                    />
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    <strong>Last Session:</strong>{" "}
                    {selectedStudent.last_appointment
                      ? selectedStudent.last_appointment
                      : "No Appointment yet"}
                  </Typography>
                </Box>
              )}
              {tab === 1 && <Typography>Academic Records...</Typography>}
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
                  Case Details: {selectedStudent.first_name}
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
                Case notes and history for {selectedStudent.first_name} will be
                displayed here.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Example: Last counseling session was on{" "}
                {selectedStudent.last_appointment
                  ? selectedStudent.last_appointment
                  : "N/A"}
                .
              </Typography>
            </>
          )}
        </Box>
      </Modal>

      {isEditing && (
        <Button onClick={handleStatus} sx={{ mt: 3 }} variant="outlined">
          SAVE CHANGES
        </Button>
      )}
    </Box>
  );
};

export default Students;
