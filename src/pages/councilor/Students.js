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
import { analyzeBehavior } from "../../utils/behaviorUtils";

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
  const [AllRecords, setAllRecords] = useState([]);
  const [caseRecords, setCaseRecords] = useState([]);
  console.log(caseRecords, "Case Records");
  const [quickNotes, setQuickNotes] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);

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

  // Academic Lookup
  const fetchRecords = async (studentId) => {
    try {
      const response = await fetch(
        `/counselorManageStudentRoutes/academic_records/${studentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch records");
      const data = await response.json();
      setAllRecords(data);
    } catch (error) {
      console.error("Error fetching academic records:", error);
    } finally {
      setLoading(false);
    }
  };

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

      // Update local state immediately to reflect the new status
      setStudents((prev) =>
        prev.map((student) =>
          markSelectedStudents.includes(student.student_no)
            ? { ...student, status: newStatus }
            : student
        )
      );

      // Also update filteredStudents if you’re using search
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
  const handleOpenCase = async (student) => {
    setSelectedStudent(student);
    setOpenCase(true);
    await fetchCaseRecords(student.id);
  };
  const handleCloseCase = () => {
    setOpenCase(false);
    setSelectedStudent(null);
    setCaseRecords([]);
    setQuickNotes([]);
  };

  // Fetch case records for a student
  const fetchCaseRecords = async (studentId) => {
    setLoadingCases(true);
    try {
      const response = await fetch(
        `/caseRecordsCounselor/student-cases/${studentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch case records");
      const data = await response.json();
      setCaseRecords(data.caseRecords);
      setQuickNotes(data.quickNotes);
    } catch (error) {
      console.error("Error fetching case records:", error);
    } finally {
      setLoadingCases(false);
    }
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

      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="flex-start" // align items at top
      >
        {filteredStudents && filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  border: markSelectedStudents.includes(student.student_no)
                    ? `2px solid ${theme.palette.primary.main}`
                    : "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => {
                  if (isEditing) {
                    setMarkSelectedStudents((prev) =>
                      prev.includes(student.student_no)
                        ? prev.filter((id) => id !== student.student_no)
                        : [...prev, student.student_no]
                    );
                  }
                }}
              >
                <CardContent sx={{ 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column",
                  p: { xs: 1.5, sm: 2, md: 2 }
                }}>
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

                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2, 
                      flexGrow: 1,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" }
                    }}
                  >
                    Last Session: {student.last_appointment || "No Appointments yet"}
                  </Typography>

                  <Box 
                    display="flex" 
                    gap={1} 
                    sx={{ 
                      mt: "auto",
                      flexDirection: { xs: "column", sm: "row" }
                    }}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCase(student);
                      }}
                      variant="contained"
                      size="small"
                      fullWidth={{ xs: true, sm: false }}
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      View Case
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProfile(student);
                        fetchRecords(student.id);
                      }}
                      variant="outlined"
                      size="small"
                      fullWidth={{ xs: true, sm: false }}
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
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
              sx={{ py: 6, width: "100%" }}
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
            width: { xs: "95%", sm: "85%", md: "70%", lg: "60%" },
            maxWidth: 800,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: { xs: 2, sm: 3 },
            maxHeight: { xs: "95vh", sm: "90vh" },
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedStudent && (
            <>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  Student Profile:{" "}
                  {`${selectedStudent.first_name} ${selectedStudent.last_name}`}
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
                    <strong>Name:</strong>{" "}
                    {`${selectedStudent.first_name} ${selectedStudent.last_name}`}
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
              {tab === 1 && (
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxHeight: { xs: 250, sm: 300, md: 350 },
                    overflowY: "auto",
                    minHeight: 0,
                    flexGrow: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Academic Records
                  </Typography>

                  {/* Records Section */}
                  {loading ? (
                    <Typography color="text.secondary">
                      Loading records...
                    </Typography>
                  ) : AllRecords.records && AllRecords.records.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {AllRecords.records?.map((record, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                          }}
                        >
                          <Typography
                            variant="body1"
                            fontWeight={500}
                            color="text.primary"
                          >
                            {record.course}
                          </Typography>
                          <Chip
                            label={record.grade}
                            size="small"
                            sx={{
                              backgroundColor:
                                record.grade === "A+" || record.grade === "A"
                                  ? "success.main"
                                  : record.grade.startsWith("B")
                                    ? "info.main"
                                    : record.grade.startsWith("C")
                                      ? "warning.main"
                                      : "error.main",
                              color: "#fff",
                              fontWeight: "bold",
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      No academic records available.
                    </Typography>
                  )}

                  {/* GPA / Total Grades */}
                  {AllRecords.totalGrades && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "grey.100",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        Total GPA:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary"
                      >
                        {AllRecords.totalGrades}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {tab === 2 && (
                <Box
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Behavioral History
                  </Typography>

                  {loading ? (
                    <Typography color="text.secondary">
                      Loading history...
                    </Typography>
                  ) : AllRecords && AllRecords.overallNote ? (
                    (() => {
                      const { label, color, emoji } = analyzeBehavior(
                        AllRecords.overallNote
                      );

                      return (
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            boxShadow: 3,
                            backgroundColor: "background.paper",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            transition:
                              "transform 0.25s ease, box-shadow 0.25s ease",
                            "&:hover": {
                              transform: "scale(1.02)",
                              boxShadow: 5,
                            },
                          }}
                        >
                          {/* Icon */}
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: `${color.split(".")[0]}.light`,
                              color: `${color.split(".")[0]}.dark`,
                              fontSize: "1.8rem",
                            }}
                          >
                            {emoji}
                          </Box>

                          {/* Content */}
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              Summary
                            </Typography>
                            <Typography
                              variant="body1"
                              color="text.secondary"
                              sx={{ mt: 0.5, lineHeight: 1.6 }}
                            >
                              {AllRecords.overallNote}
                            </Typography>
                            <Box sx={{ mt: 1.5 }}>
                              <Chip
                                label={label}
                                sx={{
                                  backgroundColor: color,
                                  color: "#fff",
                                  fontWeight: 500,
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      );
                    })()
                  ) : (
                    <Typography color="text.secondary">
                      No behavioral history available.
                    </Typography>
                  )}
                </Box>
              )}
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
            width: { xs: "95%", sm: "80%", md: "60%", lg: "50%" },
            maxWidth: 700,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: { xs: 2, sm: 3 },
            maxHeight: { xs: "95vh", sm: "85vh", md: "80vh" },
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
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

              {loadingCases ? (
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography>Loading case records...</Typography>
                </Box>
              ) : caseRecords.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    flexGrow: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    p: 1,
                  }}
                >
                  {caseRecords.map((caseRecord) => {
                    const relatedNotes = quickNotes.filter(
                      (note) => note.case_record_id === caseRecord.id
                    );

                    return (
                      <Card
                        key={caseRecord.id}
                        sx={{
                          borderRadius: 3,
                          boxShadow: 3,
                          p: 2,
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: 6,
                          },
                          border: "1px solid green",
                          // ---- NEW ----
                          display: "flex",
                          flexDirection: "column",
                          minHeight: 300,          // enough space for empty card
                          maxHeight: 550,          // optional upper bound
                          overflowY: "auto",       // scroll inside card if needed
                        }}
                      >
                        {/* ---------- Header ---------- */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold">
                            {caseRecord.case_type}
                          </Typography>
                          <Chip
                            label={caseRecord.session_type}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>

                        {/* ---------- Info Grid ---------- */}
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            flexDirection: "column",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 150 }}>
                            <strong>Date:</strong> {caseRecord.date}
                          </Typography>

                          {caseRecord.offense && (
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 150 }}>
                              <strong>Offense:</strong> {caseRecord.offense}
                            </Typography>
                          )}

                          {caseRecord.counselor_first_name && (
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                              <strong>Counselor:</strong> {caseRecord.counselor_first_name}{" "}
                              {caseRecord.counselor_last_name}
                            </Typography>
                          )}

                          {caseRecord.remarks && (
                            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                              <strong>Remarks:</strong> {caseRecord.remarks}
                            </Typography>
                          )}
                        </Box>

                        {/* ---------- Quick Notes (always visible) ---------- */}
                        <Box sx={{ mt: "auto" /* push to bottom if card grows */ }}>
                          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                            Quick Notes:
                          </Typography>

                          {relatedNotes.length > 0 ? (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {relatedNotes.map((note) => (
                                <Chip
                                  key={note.id}
                                  label={note.name}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              No quick notes added yet.
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No case records found for {selectedStudent.first_name}.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Case records will appear here once they are created.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>
          {/* Only shows if there are selected students and is Editing */}
      {isEditing && markSelectedStudents.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button 
            onClick={handleStatus} 
            variant="outlined"
            sx={{ 
              minWidth: { xs: 120, sm: 150 },
              fontSize: { xs: "0.875rem", sm: "1rem" }
            }}
          >
            SAVE CHANGES
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Students;
