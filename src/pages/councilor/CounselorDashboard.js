import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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

// Style for the modal, centered on the screen
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "1px solid #ddd",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  height: 650,
};

// Component for the Appointments Modal
const AppointmentsModal = ({ open, handleClose, appointments }) => {
  const [filter, setFilter] = useState("all");


  // Dynamic Date
  const today = new Date().toISOString().split("T")[0]; // A placeholder for the current date
  const oneWeekLater = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0]; // A placeholder for one week later
  const oneMonthLater = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0]; // A placeholder for one month later

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
        <Typography variant="h6" gutterBottom>
          All Upcoming Appointments
        </Typography>

        <ButtonGroup variant="outlined" aria-label="appointment filter">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "contained" : "outlined"}
          >
            All
          </Button>
          <Button
            onClick={() => setFilter("today")}
            variant={filter === "today" ? "contained" : "outlined"}
          >
            Today
          </Button>
          <Button
            onClick={() => setFilter("week")}
            variant={filter === "week" ? "contained" : "outlined"}
          >
            Week
          </Button>
          <Button
            onClick={() => setFilter("month")}
            variant={filter === "month" ? "contained" : "outlined"}
          >
            Month
          </Button>
        </ButtonGroup>

        <Divider sx={{ my: 2 }} />

        <Stack
          sx={{
            border: "1px solid",
            borderRadius: 2,
            height: 400,
            overflowY: "auto",
          }}
          divider={<Divider />}
          spacing={2}
        >
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appt, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {appt.counselor_first_name} {appt.counselor_middle_name} {appt.counselor_last_name}
                </Typography>
                <Chip label={appt.mode} size="small" sx={{ mt: 0.5 }} />
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2">{appt.date}</Typography>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">{appt.time}</Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
              No appointments for this period.
            </Typography>
          )}
        </Stack>

        <Button onClick={handleClose} variant="contained" sx={{ mt: 4 }}>
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
  

  const navigate = useNavigate();

  // Handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const openviewCaseModal = () => setViewcaseModal(true);
  const closeviewCaseModal = () => setViewcaseModal(false);
  const handleOpenViewCase = (student) => {
    console.log(student, "students")
    setSelectedStudent(student);
    setOpenViewCase(true);
  };

  const handleCloseViewCase = () => {
    setSelectedStudent(null);
    setOpenViewCase(false);
  };

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
        console.log(data, "data");
        setStudents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []); // add userId as dependency

  // Select student to show quick notes
  const fetchQuickNotes = async (studentId) => {
    try {
      setLoading(true);
      const response = await fetch(`/counselorDashboard/quick_notes?studentId=${studentId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Acquired the quick notes that's grouped by case record id
      setQuickNotes(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quick notes:", error);
    }
  };

  // const appointments = [
  //   {
  //     name: "Alice Johnson",
  //     type: "Academic Counseling",
  //     date: "2024-07-25",
  //     time: "10:00 AM",
  //   },
  //   {
  //     name: "Charlie Davis",
  //     type: "Behavioral Support",
  //     date: "2024-07-26",
  //     time: "02:30 PM",
  //   },
  //   {
  //     name: "Diana Miller",
  //     type: "Career Guidance",
  //     date: "2024-07-27",
  //     time: "11:00 AM",
  //   },
  // ];

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
        console.log(data, "data case updates")
        setCaseUpdates(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching case updates:", error);
      }
    };
    fetchCaseUpdates();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {/* Welcome header */}
      <Card
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left side content */}
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Welcome Counselor Alex!
            </Typography>
            <Typography variant="subtitle2">
              Sunday, September 21, 2025 - Monitor appointments, student cases,
              and reports at a glance
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Top Row: 3 Main Cards */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        {/* My Students */}
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography fontWeight="bold">Students Overview</Typography>
              <Button
                onClick={() => navigate("/dashboard/counselor/students")}
                size="small"
                variant="contained"
              >
                View All
              </Button>
            </Box>
            {students.map((student, index) => (
              <React.Fragment key={index}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "grey.50",
                    p: 0.5,
                    borderRadius: 2,
                    mb: 1.5,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "grey.100",
                      boxShadow: 3,
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "70%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 1,
                    }}
                  >
                    {/* Left side: Avatar + Name */}
                    {loading ? (
                      <Skeleton
                        variant="rectangular"
                        width={210}
                        height={60}
                        animation="wave"
                      />
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar>{student.first_name.charAt(0)}</Avatar>
                        <Typography sx={{ fontSize: 12 }}>
                          {student.first_name}
                        </Typography>
                      </Box>
                    )}

                    {/* Right side: Status Chip */}
                    {loading ? (
                      <Skeleton
                        variant="rectangular"
                        width={210}
                        height={60}
                        animation="wave"
                      />
                    ) : (
                    <Chip
                      label={student.status}
                      size="small"
                      sx={{
                        height: 21,
                        display: "flex",
                        fontSize: 11,
                        alignItems: "center",
                        backgroundColor:
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
                  >
                    View Case
                  </Button>
                </Box>

                {index < students.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>

        {/*------------- VIEW CASE --------------- */}
        <Modal open={openViewCase} onClose={handleCloseViewCase}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
            }}
          >
            {selectedStudent && (
              <>
                {/* Header */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {selectedStudent.first_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedStudent.first_name}
                    </Typography>
                    <Chip
                      label={selectedStudent.status}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Fake case details for now */}
                <Box
                  sx={{
                    maxHeight: 300,          // slightly taller to fit more notes
                    overflowY: "auto",
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Quick Notes</Typography>

                  {quickNotes.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No quick notes available.
                    </Typography>
                  )}

                  {Object.entries(quickNotes).map(([caseRecordId, notes]) => (
                    <Box
                      key={caseRecordId}
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.100",
                        boxShadow: 1,
                      }}
                    >
                      {/* Case header */}
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}
                      >
                        Case Record ID: {caseRecordId}
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Date/Time:{" "}
                        <Box component="span" sx={{ fontWeight: 400 }}>
                          {new Date(notes[0].date).toLocaleDateString()}{" "}
                          {new Date(notes[0].date).toLocaleTimeString()}
                        </Box>
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Case Type:{" "}
                        <Box component="span" sx={{ fontWeight: 400 }}>
                          {notes[0].case_type}
                        </Box>
                      </Typography>

                      {/* Notes list */}
                      {notes.map((note) => (
                        <Paper
                          key={note.id}
                          variant="outlined"
                          sx={{
                            p: 1.5,
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
                          <Typography variant="body2" sx={{ pl: 1 }}>
                            • {note.name}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  ))}

                </Box>


                {/* Footer */}
                <Box textAlign="right" mt={3}>
                  <Button onClick={handleCloseViewCase} sx={{ mr: 2 }}>
                    Close
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Upcoming Appointments */}
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography fontWeight="bold">Upcoming Appointments</Typography>
              <Button navigate to="/students" onClick={handleOpenModal} size="small" variant="outlined">
                View All
              </Button>
            </Box>

            {appointments.map((appt, index) => (
              <React.Fragment key={index}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "grey.100",
                      boxShadow: 3,
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <Skeleton variant="text" width="60%" height={28} animation="wave" />
                      <Skeleton variant="rectangular" width="30%" height={22} sx={{ mt: 1, borderRadius: 1 }} />
                      <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {`${appt.counselor_first_name} ${appt.counselor_middle_name} ${appt.counselor_last_name}`}
                      </Typography>

                      <Chip label={appt.mode} size="small" sx={{ mt: 0.5 }} />

                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="body2">{appt.date}</Typography>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">{appt.time}</Typography>
                      </Box>
                    </>
                  )}
                </Box>

                {index < appointments.length - 1 && <Divider sx={{ my: 2 }} />}
              </React.Fragment>
            ))}

          </CardContent>
        </Card>

        {/* Recent Case Updates */}
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                sx={{ fontSize: 16, fontWeight: 600 }}
                variant="h6"
                gutterBottom
              >
                All Case Records
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={openviewCaseModal}
              >
                View All
              </Button>
            </Box>

            {caseUpdates.map((update, index) => {
              // Convert ISO date to readable format
              const dateObj = new Date(update.date);
              const readableDate = dateObj.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                weekday: "short",
              });
              const readableTime = dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <React.Fragment key={index}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "grey.50",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "grey.100",
                        boxShadow: 3,
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    {/* Student Name */}
                    <Typography fontWeight="bold" variant="subtitle1" mb={0.5}>
                      {`${update.first_name} ${update.middle_name} ${update.last_name}`}
                    </Typography>

                    {/* Case Details */}
                    <Typography variant="body2" color="text.primary" mb={0.5}>
                      <strong>Case Type:</strong> {update.case_type}
                    </Typography>
                    <Typography variant="body2" color="text.primary" mb={0.5}>
                      <strong>Offense:</strong> {update.offense}
                    </Typography>
                    <Typography variant="body2" color="text.primary" mb={0.5}>
                      <strong>Session Type:</strong> {update.session_type}
                    </Typography>
                    <Typography variant="body2" color="text.primary" mb={0.5}>
                      <strong>Remarks:</strong> {update.remarks}
                    </Typography>

                    {/* Date and Time */}
                    <Typography variant="caption" color="text.secondary">
                      {readableDate} at {readableTime}
                    </Typography>
                  </Paper>

                  {/* Divider between cards */}
                  {index < caseUpdates.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              );
            })}

          </CardContent>
        </Card>
      </Box>

      <Modal
        open={ViewcaseModal}
        onClose={closeviewCaseModal}
        aria-labelledby="recent-case-updates-modal-title"
        aria-describedby="recent-case-updates-modal-description"
      >
        <Box
          sx={{
            ...modalStyle,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            id="recent-case-updates-modal-title"
            variant="h6"
            gutterBottom
          >
            All Recent Case Updates
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Scrollable content */}
          <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
            <Stack divider={<Divider />} spacing={2}>
              {caseUpdates.length > 0 ? (
                caseUpdates.map((update, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "grey.50",
                    }}
                  >
                    <Typography fontWeight="bold">{update.first_name} {update.middle_name} {update.last_name}</Typography>
                    <Typography variant="body2" mb={0.5}>
                      {update.case_type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {update.date} at {update.time}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
                  No case updates available.
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button onClick={closeviewCaseModal} variant="contained">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Quick Action Row */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Card
          sx={{
            flex: 1,
            borderRadius: 3,
            boxShadow: 3,
            p: 2,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AssessmentIcon color="text" />
              <Typography variant="h6" fontWeight="bold">
                Generate Reports
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Quickly create detailed reports on student progress, appointments,
              or case histories.
            </Typography>
            <Button
              onClick={() => navigate("/dashboard/counselor/reports")}
              variant="contained"
              size="small"
            >
              Generate Now
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* The Appointments Modal component */}
      <AppointmentsModal
        open={openModal}
        handleClose={handleCloseModal}
        appointments={appointments}
      />
    </Box>
  );
};

export default CounselorDashboard;
