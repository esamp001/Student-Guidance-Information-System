import React, { useState } from "react";
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
} from "@mui/material";

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

  const today = "2024-07-25"; // A placeholder for the current date
  const oneWeekLater = "2024-08-01"; // A placeholder for one week later
  const oneMonthLater = "2024-08-25"; // A placeholder for one month later

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
                  {appt.name}
                </Typography>
                <Chip label={appt.type} size="small" sx={{ mt: 0.5 }} />
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
  // State
  const [openModal, setOpenModal] = useState(false);
  const [openViewCase, setOpenViewCase] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [ViewcaseModal, setViewcaseModal] = useState(false);

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

  const students = [
    { name: "Alice Johnson", status: "Active" },
    { name: "Bob Williams", status: "On-hold" },
    { name: "Charlie Davis", status: "Active" },
    { name: "Diana Miller", status: "Active" },
    { name: "Ethan White", status: "Inactive" },
  ];

  const appointments = [
    {
      name: "Alice Johnson",
      type: "Academic Counseling",
      date: "2024-07-25",
      time: "10:00 AM",
    },
    {
      name: "Charlie Davis",
      type: "Behavioral Support",
      date: "2024-07-26",
      time: "02:30 PM",
    },
    {
      name: "Diana Miller",
      type: "Career Guidance",
      date: "2024-07-27",
      time: "11:00 AM",
    },
  ];

  const caseUpdates = [
    {
      name: "Alice Johnson",
      update: "Follow-up on academic progress",
      time: "2 hours ago",
    },
    {
      name: "Bob Williams",
      update: "Reviewed progress for math",
      time: "Yesterday",
    },
    {
      name: "Charlie Davis",
      update: "New behavioral concern",
      time: "2 days ago",
    },
    {
      name: "Diana Miller",
      update: "Career guidance session",
      time: "3 days ago",
    },
  ];

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
                onClick={() => navigate("/Dashboard/students")}
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar>{student.name.charAt(0)}</Avatar>
                      <Typography sx={{ fontSize: 12 }}>
                        {student.name}
                      </Typography>
                    </Box>

                    {/* Right side: Status Chip */}
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
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenViewCase(student)}
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
                    {selectedStudent.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedStudent.name}
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
                <Typography variant="subtitle1" gutterBottom>
                  Case History
                </Typography>
                <Box
                  sx={{
                    maxHeight: 200,
                    overflowY: "auto",
                    bgcolor: "grey.50",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" mb={1}>
                    • Counseling session scheduled on Sept 20, 2025
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    • Academic performance reviewed last week
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    • Pending follow-up session
                  </Typography>
                </Box>

                {/* Footer */}
                <Box textAlign="right" mt={3}>
                  <Button onClick={handleCloseViewCase} sx={{ mr: 2 }}>
                    Close
                  </Button>
                  <Button variant="contained" color="success">
                    Add Note
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
              <Button onClick={handleOpenModal} size="small" variant="outlined">
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
                  <Typography variant="subtitle1" fontWeight="bold">
                    {appt.name}
                  </Typography>
                  <Chip label={appt.type} size="small" sx={{ mt: 0.5 }} />
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2">{appt.date}</Typography>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">{appt.time}</Typography>
                  </Box>
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
                All Upcoming Appointments
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={openviewCaseModal}
              >
                View All
              </Button>
            </Box>

            {caseUpdates.map((update, index) => (
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
                  <Typography fontWeight="bold">{update.name}</Typography>
                  <Typography variant="body2" mb={0.5}>
                    {update.update}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {update.time}
                  </Typography>
                </Box>

                {index < caseUpdates.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
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
                    <Typography fontWeight="bold">{update.name}</Typography>
                    <Typography variant="body2" mb={0.5}>
                      {update.update}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {update.time}
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
              onClick={() => navigate("/Dashboard/reports")}
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
