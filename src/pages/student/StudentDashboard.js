import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  CardContent,
  Divider,
  Card,
  Stack,
  Skeleton,
} from "@mui/material";
import theme from "../../theme";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRole } from "../../context/RoleContext";
import useSnackbar from "../../hooks/useSnackbar";

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
    path: "/Dashboard/profile",
  },
  {
    title: "Request Appointment",
    description:
      "Schedule a new counseling session or check available slots with ease.",
    buttonText: "Request Now",
    icon: <EventAvailableIcon color="primary" fontSize="medium" />,
    path: "/Dashboard/appointments",
  },
  {
    title: "Counseling History",
    description:
      "Review your past counseling sessions, notes, and progress reports.",
    buttonText: "View History",
    icon: <HistoryEduIcon color="primary" fontSize="medium" />,
    path: "/Dashboard/history",
  },
  {
    title: "Notifications",
    description: "Stay informed with important updates, alerts, and messages.",
    buttonText: "View Notifications",
    icon: <NotificationsIcon color="primary" fontSize="medium" />,
    path: "/Dashboard/notifications",
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
  const navigate = useNavigate();
  const { user } = useRole();
  const [loading, setLoading] = useState(false);
  const [studentLookUp, setStudentLookUp] = useState([]);
  const [history, setHistory] = useState([]);
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  // LOOK UP - STUDENT DASHBOARD
  useEffect(() => {
    setLoading(true);

    const loadData = async () => {
      try {
        const response = await fetch(
          `/studentDashboardRoutes/student/data/lookup?userId=${user.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch student dashboard data");
        } else {
          const data = await response.json();
          setStudentLookUp(data); // now data is just the student object, not an array
        }
      } catch (error) {
        console.error("Error loading navbar data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // LOOK UP - History
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;

      setLoading(true);

      try {
        const res = await fetch(
          `/studentDashboardRoutes/counseling/history/lookup?student_id=${user.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          showSnackbar("Failed to fetch counseling history.", "error");
          throw new Error("Failed to fetch history");
        }

        const data = await res.json();
        setHistory(data);
      } catch (err) {
        showSnackbar("Unable to load counseling history.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box
        sx={{
          height: "20vh",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="subtitle3">{studentLookUp.currentDate}</Typography>
        <Typography sx={{ fontWeight: 700 }} variant="h3">
          {loading ? (
            <Skeleton width={300} height={80} />
          ) : studentLookUp?.first_name ? (
            `Welcome, ${studentLookUp.first_name}`
          ) : (
            "Welcome"
          )}
        </Typography>
      </Box>
      <Typography variant="subtitle5" sx={{ fontWeight: 700, mt: 4 }}>
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
              flexDirection: "column",
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "grey.100",
                boxShadow: 3,
                transform: "scale(1.02)",
              },
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
              <Button
                onClick={() => navigate(item.path)}
                sx={{ width: "80%", mt: 5, mb: 1 }}
                variant="outlined"
              >
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
              <Box
                sx={{
                  maxHeight: 400, // control your height here (px or vh)
                  overflowY: "auto",
                  pr: 1, // avoid scrollbar overlap
                }}
              >
                <Stack spacing={2}>
                  {history.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        borderRadius: 1,
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <CalendarTodayIcon color="primary" fontSize="small" />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {item.date}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.time} with{" "}
                            {`${item.first_name} ${item.last_name}`}
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
              </Box>
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
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "grey.100",
                        boxShadow: 3,
                        transform: "scale(1.02)",
                      },
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
