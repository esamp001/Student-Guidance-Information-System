import React from "react";
import { Box, Button, Paper, Typography, Chip } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import theme from "../../theme";

// Icons
import SchoolIcon from "@mui/icons-material/School";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import NotificationsIcon from "@mui/icons-material/Notifications";

//  Example data (you can import instead if defined elsewhere)
const studentDashboardItems = [
  {
    title: "My Profile",
    description:
      "View and update your personal and academic information effortlessly.",
    buttonText: "View Profile",
    icon: <SchoolIcon color="primary" fontSize="medium" />,
  },
  {
    title: "Request Appointment",
    description:
      "Schedule a new counseling session or check available slots with ease.",
    buttonText: "Request Now",
    icon: <EventAvailableIcon color="primary" fontSize="medium" />,
  },
  {
    title: "Counseling History",
    description:
      "Review your past counseling sessions, notes, and progress reports.",
    buttonText: "View History",
    icon: <HistoryEduIcon color="primary" fontSize="medium" />,
  },
  {
    title: "Notifications",
    description: "Stay informed with important updates, alerts, and messages.",
    buttonText: "View Notifications",
    icon: <NotificationsIcon color="primary" fontSize="medium" />,
  },
];

const appointments = [
  {
    date: "June 10, 2024",
    time: "10:00 AM - 11:00 AM",
    counselor: "Ms. Emily White",
    status: "Completed",
    statusColor: "success", // green
  },
  {
    date: "June 17, 2024",
    time: "02:00 PM - 03:00 PM",
    counselor: "Mr. David Lee",
    status: "Scheduled",
    statusColor: "primary", // blue
  },
  {
    date: "July 01, 2024",
    time: "11:30 AM - 12:30 PM",
    counselor: "Ms. Sarah Chen",
    status: "Scheduled",
    statusColor: "primary", // blue
  },
];

const StudentDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box
        sx={{
          bgcolor: theme.palette.secondary.second,
          height: "20vh",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", // vertical center
          alignItems: "flex-start", // align left
        }}
      >
        <Typography variant="subtitle3">Friday, June 14th</Typography>
        <Typography sx={{ fontWeight: 700 }} variant="h4">
          Welcome, Alex Johnson
        </Typography>
      </Box>
      <Typography
        variant="subtitle1" // use a valid variant
        sx={{ fontWeight: 700, mt: 4 }} // mt = theme.spacing(4)
      >
        Quick Actions
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "center" }}>
        {studentDashboardItems.map((item, index) => (
          <Paper key={index} sx={{ p: 2, width: "30%" }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: theme.palette.primary.main,
              }}
            >
              {item.icon}
              {item.title}
            </Typography>
            <Typography sx={{ mt: 2 }} variant="subtitle2">
              {item.description}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 7 }}>
              <Button sx={{ width: "80%" }} variant="outlined">
                {item.buttonText}
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
      <Typography variant="h6" sx={{ mt: 4, fontWeight: 700, mb: 2 }}>
        Recent Appointments
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {appointments.map((appt, index) => (
          <Paper
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            {/* Left side: Icon */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <EventIcon sx={{ color: "primary.main", fontSize: 30 }} />

              {/* Appointment details */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {appt.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {appt.time} with {appt.counselor}
                </Typography>
              </Box>
            </Box>

            {/* Right side: Status */}
            <Chip
              label={appt.status}
              color={appt.statusColor}
              variant="filled"
              sx={{ fontWeight: 500 }}
            />
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default StudentDashboard;
