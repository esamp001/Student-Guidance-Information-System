import React from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Grid,
  CardContent,
  Divider,
  Card,
  Stack,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import theme from "../../theme";

// Icons
import SchoolIcon from "@mui/icons-material/School";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

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

const historyData = [
  {
    id: 1,
    date: "June 10, 2024",
    time: "10:00 AM - 11:00 AM",
    with: "Ms. Emily White",
    status: "Completed",
    feedback: "Feedback Provided",
  },
  {
    id: 2,
    date: "June 17, 2024",
    time: "2:00 PM - 3:00 PM",
    with: "Mr. David Lee",
    status: "Scheduled",
  },
  {
    id: 3,
    date: "July 01, 2024",
    time: "11:30 AM - 12:30 PM",
    with: "Ms. Sarah Chen",
    status: "Scheduled",
  },
  {
    id: 4,
    date: "May 25, 2024",
    time: "9:00 AM - 10:00 AM",
    with: "Dr. John Smith",
    status: "Completed",
    feedback: "Feedback Pending",
  },
];

const notificationsData = [
  {
    id: 1,
    message:
      "Your appointment with Mr. David Lee on June 17th has been confirmed.",
    time: "5 minutes ago",
  },
  {
    id: 2,
    message: "New feedback available for your session with Ms. Emily White.",
    time: "2 hours ago",
  },
  {
    id: 3,
    message: "System maintenance scheduled for June 20th, 1 AM - 3 AM PDT.",
    time: "Yesterday",
  },
  {
    id: 4,
    message:
      "Reminder: Your session with Ms. Sarah Chen on July 1st is approaching.",
    time: "2 days ago",
  },
];

const StudentDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box
        sx={{
          height: "20vh",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", // vertical center
          alignItems: "flex-start", // align left
        }}
      >
        <Typography variant="subtitle3">Friday, June 14th</Typography>
        <Typography sx={{ fontWeight: 700 }} variant="h3">
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
          <Paper
            key={index}
            sx={{
              p: 2,
              width: "30%",
              display: "flex",
              flexDirection: "column", // stack content vertically
            }}
          >
            {/* Title */}
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

            {/* Description */}
            <Typography sx={{ mt: 2 }} variant="subtitle2">
              {item.description}
            </Typography>

            {/* Button at bottom */}
            <Box sx={{ mt: "auto", display: "flex", justifyContent: "center" }}>
              <Button sx={{ width: "80%", mt: 5, mb: 1 }} variant="outlined">
                {item.buttonText}
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          mt: 3,
        }}
      >
        {/* Counseling History */}
        <Box sx={{ display: "flex" }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, width: 700 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Counseling History
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {historyData.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "grey.50",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <CalendarTodayIcon color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {item.date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.time} with {item.with}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={item.status}
                        size="small"
                        color={
                          item.status === "Completed"
                            ? "success"
                            : item.status === "Scheduled"
                            ? "info"
                            : "default"
                        }
                      />
                      {item.feedback && (
                        <Chip
                          label={item.feedback}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Notifications */}
        <Box sx={{ display: "flex" }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {notificationsData.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "grey.50",
                    }}
                  >
                    <NotificationsNoneIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="body2">{item.message}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {item.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
