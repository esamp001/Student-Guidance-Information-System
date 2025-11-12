import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import theme from "../../theme";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  Modal,
  Stack,
  ButtonGroup,
  Paper,
  Skeleton,
} from "@mui/material";
import { useRole } from "../../context/RoleContext";
// Icons
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// Responsive modal style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 600 },
  maxWidth: 700,
  bgcolor: "background.paper",
  border: "1px solid #ddd",
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  borderRadius: 2,
  maxHeight: "90vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

// Component for the Appointments Modal
const AppointmentsModal = ({ open, handleClose, appointments }) => {
  const [filter, setFilter] = useState("all");
  // Dynamic Date
  const today = new Date().toISOString().split("T")[0];
  const oneWeekLater = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0];
  const oneMonthLater = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0];

  const getFilteredAppointments = () => {
    switch (filter) {
      case "today":
        return appointments.filter((appt) => appt.date === today);
      case "week":
        return appointments.filter(
          (appt) => new Date(appt.date) <= new Date(oneWeekLater)
        );
      case "month":
        return appointments.filter(
          (appt) => new Date(appt.date) <= new Date(oneMonthLater)
        );
      case "all":
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="appointments-modal-title"
      aria-describedby="appointments-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
          All Upcoming Appointments
        </Typography>
        <ButtonGroup
          variant="outlined"
          aria-label="appointment filter"
          fullWidth
          sx={{ mb: 2, flexWrap: "wrap", gap: 0.5 }}
        >
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "contained" : "outlined"}
            size="small"
            sx={{ flex: 1, minWidth: 60 }}
          >
            All
          </Button>
          <Button
            onClick={() => setFilter("today")}
            variant={filter === "today" ? "contained" : "outlined"}
            size="small"
            sx={{ flex: 1, minWidth: 60 }}
          >
            Today
          </Button>
          <Button
            onClick={() => setFilter("week")}
            variant={filter === "week" ? "contained" : "outlined"}
            size="small"
            sx={{ flex: 1, minWidth: 60 }}
          >
            Week
          </Button>
          <Button
            onClick={() => setFilter("month")}
            variant={filter === "month" ? "contained" : "outlined"}
            size="small"
            sx={{ flex: 1, minWidth: 60 }}
          >
            Month
          </Button>
        </ButtonGroup>
        <Divider sx={{ my: 1 }} />
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 1,
            pb: 1,
          }}
        >
          <Stack spacing={1.5} divider={<Divider />}>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, index) => (
                <Box
                  key={index}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                  >
                    {appt.counselor_first_name} {appt.counselor_middle_name} {appt.counselor_last_name}
                  </Typography>
                  <Chip label={appt.mode} size="small" sx={{ mt: 0.5, fontSize: "0.7rem" }} />
                  <Box display="flex" alignItems="center" gap={0.5} mt={1} flexWrap="wrap">
                    <EventIcon fontSize="small" color="action" sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                      {appt.date}
                    </Typography>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                      {appt.time}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography
                variant="body1"
                sx={{ textAlign: "center", mt: 4, fontSize: { xs: "0.9rem", sm: "1rem" } }}
              >
                No appointments for this period.
              </Typography>
            )}
          </Stack>
        </Box>
        <Button onClick={handleClose} variant="contained" sx={{ mt: 2 }} fullWidth>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

const CounselorDashboard = () => {
  const { user } = useRole();
  // State
  const [openModal, setOpenModal] = useState(false);
  const [openViewCase, setOpenViewCase] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [ViewcaseModal, setViewcaseModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [quickNotes, setQuickNotes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [caseUpdates, setCaseUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counselorFullName, setCounselorFullName] = useState([]);
  console.log(counselorFullName, "Counselor Full Name");

  const navigate = useNavigate();

  // Handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const openviewCaseModal = () => setViewcaseModal(true);
  const closeviewCaseModal = () => setViewcaseModal(false);
  const handleOpenViewCase = (student) => {
    setSelectedStudent(student);
    setOpenViewCase(true);
  };
  const handleCloseViewCase = () => {
    setSelectedStudent(null);
    setOpenViewCase(false);
  };

  // Fetch counselor full name to be displayed on dashboard
  useEffect(() => {
    const fetchCounselorFullName = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/counselorDashboard/counselor_full_name?userId=${user.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data, "Counselor full name");
        setCounselorFullName(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching counselor full name:", error);
      }
    };
    fetchCounselorFullName();
  }, []);

  // All Students lookup
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/counselorDashboard/student_lookup`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStudents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  // Select student to show quick notes
  const fetchQuickNotes = async (studentId) => {
    try {
      setLoading(true);
      const response = await fetch(`/counselorDashboard/quick_notes?studentId=${studentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuickNotes(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quick notes:", error);
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/counselorDashboard/upcoming_appointments?userId=${user.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAppointments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchCaseUpdates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/counselorDashboard/case_updates?userId=${user.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCaseUpdates(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching case updates:", error);
      }
    };
    fetchCaseUpdates();
  }, []);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
      {/* Welcome header */}
      <Card
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <CardContent sx={{ p: 0, flex: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem" } }}
            >
              {counselorFullName.length > 0 && (
                <>
                  Welcome Counselor {counselorFullName[0].first_name} {counselorFullName[0].middle_name} {counselorFullName[0].last_name}!
                </>
              )}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" }, color: "text.secondary" }}
            >
              Sunday, September 21, 2025 - Monitor appointments, student cases, and reports at a glance
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Top Row: 3 Main Cards */}
      <Box
        sx={{
          display: "grid",
          gap: { xs: 1.5, sm: 2 },
          mt: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
        }}
      >
        {/* My Students */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, minHeight: 300 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1.5}
              flexWrap="wrap"
              gap={1}
            >
              <Typography fontWeight="bold" sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>
                Students Overview
              </Typography>
              <Button
                onClick={() => navigate("/dashboard/counselor/students")}
                size="small"
                variant="contained"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
              >
                View All
              </Button>
            </Box>
            {students.length > 0 ? (
              students.map((student, index) => (
                <React.Fragment key={index}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      bgcolor: "grey.50",
                      p: { xs: 1.5, sm: 1 }, // slightly bigger padding
                      borderRadius: 2,
                      mb: 2, // a bit more margin-bottom
                      gap: 1.5, // increased gap
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "grey.100",
                        boxShadow: 4, // slightly bigger shadow
                        transform: "scale(1.03)", // slightly larger hover scale
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: "100%", sm: "70%" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: { xs: 0, sm: 1.5 }, // slightly larger inner padding
                        gap: 1.5, // increased gap
                      }}
                    >
                      {loading ? (
                        <Skeleton variant="rectangular" width={200} height={50} animation="wave" />
                      ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                          <Avatar sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 }, fontSize: "0.9rem" }}>
                            {student.first_name.charAt(0)}
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: { xs: "0.8rem", sm: "0.95rem" },
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: { xs: 120, sm: 180 },
                            }}
                          >
                            {student.first_name} {student.last_name}
                          </Typography>
                        </Box>
                      )}
                      {loading ? (
                        <Skeleton variant="rectangular" width={60} height={28} animation="wave" />
                      ) : (
                        <Chip
                          label={student.status}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: { xs: 10, sm: 12 },
                            bgcolor:
                              student.status === "Active"
                                ? theme.palette.primary.tertiary
                                : student.status === "On-hold"
                                  ? theme.palette.primary.red
                                  : theme.palette.grey[500],
                            color: "#fff",
                          }}
                        />
                      )}
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        handleOpenViewCase(student);
                        fetchQuickNotes(student.id);
                      }}
                      sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, minWidth: "auto", px: 1.5 }}
                    >
                      View Case
                    </Button>
                  </Box>

                  {index < students.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Box
                sx={{
                  height: 150,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>No students found.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* VIEW CASE MODAL */}
        <Modal open={openViewCase} onClose={handleCloseViewCase}>
          <Box
            sx={{
              ...modalStyle,
              width: { xs: "90%", sm: 500 },
              maxHeight: "85vh",
            }}
          >
            {selectedStudent && (
              <>
                <Box display="flex" alignItems="center" gap={1.5} mb={2} flexWrap="wrap">
                  <Avatar sx={{ bgcolor: "primary.main", width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                    {selectedStudent.first_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
                    >
                      {selectedStudent.first_name}
                    </Typography>
                    <Chip
                      label={selectedStudent.status}
                      size="small"
                      color="primary"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    maxHeight: { xs: 250, sm: 300 },
                    overflowY: "auto",
                    borderRadius: 2,
                    pr: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                    Quick Notes
                  </Typography>
                  {quickNotes.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                      No quick notes available.
                    </Typography>
                  )}
                  {Object.entries(quickNotes).map(([caseRecordId, notes]) => (
                    <Box
                      key={caseRecordId}
                      sx={{
                        mb: 2,
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: "grey.100",
                        boxShadow: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          mb: 0.5,
                          color: "primary.main",
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        }}
                      >
                        Case Record ID: {caseRecordId}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                        Date/Time:{" "}
                        <Box component="span" sx={{ fontWeight: 400 }}>
                          {new Date(notes[0].date).toLocaleDateString()}{" "}
                          {new Date(notes[0].date).toLocaleTimeString()}
                        </Box>
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.8rem" }}>
                        Case Type:{" "}
                        <Box component="span" sx={{ fontWeight: 400 }}>
                          {notes[0].case_type}
                        </Box>
                      </Typography>
                      {notes.map((note) => (
                        <Paper
                          key={note.id}
                          variant="outlined"
                          sx={{
                            p: 1,
                            mb: 1,
                            borderRadius: 1,
                            bgcolor: "white",
                            display: "flex",
                            flexDirection: "column",
                            transition: "transform 0.2s",
                            "&:hover": {
                              transform: "scale(1.02)",
                              boxShadow: 3,
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ pl: 1, fontSize: "0.75rem" }}>
                            • {note.name}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  ))}
                </Box>
                <Box textAlign="right" mt={2}>
                  <Button onClick={handleCloseViewCase} size="small">
                    Close
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Upcoming Appointments */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, minHeight: 300 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            {/* Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              flexWrap="wrap"
              gap={1}
            >
              <Typography fontWeight="bold" sx={{ fontSize: { xs: "1rem", sm: "1.05rem" } }}>
                Upcoming Appointments
              </Typography>
              <Button
                onClick={handleOpenModal}
                size="small"
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontSize: { xs: "0.7rem", sm: "0.85rem" },
                  boxShadow: 1
                }}
              >
                View All
              </Button>
            </Box>

            {/* Content */}
            {appointments.length > 0 ? (
              appointments.map((appt, index) => (
                <React.Fragment key={index}>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: "grey.50",
                      transition: "0.25s ease",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "grey.100",
                        boxShadow: 4,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {loading ? (
                      <>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="rectangular" width="35%" height={20} sx={{ mt: 0.5 }} />
                        <Skeleton variant="text" width="50%" height={20} sx={{ mt: 0.5 }} />
                      </>
                    ) : (
                      <>
                        {/* Name + Mode */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                          <Typography
                            fontWeight="bold"
                            sx={{
                              fontSize: { xs: "0.9rem", sm: "1rem" },
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {`${appt.student_first_name} ${appt.student_middle_name} ${appt.student_last_name}`}
                          </Typography>

                          <Chip
                            label={appt.mode}
                            size="small"
                            sx={{ fontSize: "0.7rem", borderRadius: 1 }}
                            color="primary"
                            variant="outlined"
                          />
                        </Box>

                        {/* Date & Time */}
                        <Box display="flex" alignItems="center" gap={1.5} mt={1} flexWrap="wrap">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <EventIcon fontSize="small" color="action" />
                            <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{appt.date}</Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={0.5}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{appt.time}</Typography>
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>

                  {index < appointments.length - 1 && <Divider sx={{ my: { xs: 1, sm: 2 } }} />}
                </React.Fragment>
              ))
            ) : (
              <Box
                sx={{
                  height: 150,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                  No upcoming appointments.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>


        {/* Recent Case Updates */}
        <Card sx={{ borderRadius: 3, boxShadow: 2, minHeight: 500 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography sx={{ fontSize: { xs: "0.95rem", sm: "1.1rem" }, fontWeight: 600 }}>
                All Case Records
              </Typography>

              <Button
                size="small"
                variant="outlined"
                onClick={openviewCaseModal}
                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
              >
                View All
              </Button>
            </Box>

            <Box sx={{ maxHeight: 420, overflowY: "auto", pr: 1 }}>
              {caseUpdates.length > 0 ? (
                caseUpdates.map((update, index) => {
                  const dateObj = new Date(update.date);
                  const readableDate = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const readableTime = dateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <React.Fragment key={index}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid #e0e0e0",
                          bgcolor: "white",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.85rem", sm: "0.95rem" },
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                        >
                          {`${update.first_name} ${update.middle_name} ${update.last_name}`}
                        </Typography>

                        <Typography sx={{ fontSize: "0.8rem", color: "text.primary", mt: 0.3 }}>
                          {update.case_type} • {update.offense}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            mt: 0.3,
                          }}
                        >
                          {update.remarks || "No remarks"}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            mt: 0.5,
                            color: "text.disabled",
                          }}
                        >
                          {readableDate} · {readableTime}
                        </Typography>
                      </Box>
                    </React.Fragment>
                  );
                })
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography>No case records.</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>


      </Box>

      {/* All Case Updates Modal */}
      <Modal
        open={ViewcaseModal}
        onClose={closeviewCaseModal}
        aria-labelledby="recent-case-updates-modal-title"
        aria-describedby="recent-case-updates-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            id="recent-case-updates-modal-title"
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            All Recent Case Updates
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
            <Stack divider={<Divider />} spacing={1.5}>
              {caseUpdates.length > 0 ? (
                caseUpdates.map((update, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: "grey.50",
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
                    >
                      {update.first_name} {update.middle_name} {update.last_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      mb={0.5}
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      {update.case_type}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                    >
                      {update.date} at {update.time}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body1"
                  sx={{ textAlign: "center", mt: 4, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  No case updates available.
                </Typography>
              )}
            </Stack>
          </Box>
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button onClick={closeviewCaseModal} variant="contained" fullWidth>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Quick Action Row */}
      <Box sx={{ mt: 2 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AssessmentIcon color="text" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
              >
                Generate Reports
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              mb={2}
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              Quickly create detailed reports on student progress, appointments, or case histories.
            </Typography>
            <Button
              onClick={() => navigate("/dashboard/counselor/reports")}
              variant="contained"
              size="small"
              fullWidth
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              Generate Now
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Appointments Modal */}
      <AppointmentsModal
        open={openModal}
        handleClose={handleCloseModal}
        appointments={appointments}
      />
    </Box>
  );
};

export default CounselorDashboard;