import React from "react";
import {
  Box,
  Stack,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CampaignIcon from "@mui/icons-material/Campaign";
import WarningIcon from "@mui/icons-material/Warning";

const notificationsData = [
  {
    id: 1,
    title: "Tuition Payment Due",
    message: "Your next tuition payment is due on Oct 1, 2025.",
    date: "Sept 23, 2025",
    read: false,
    icon: <WarningIcon />,
    color: "error",
  },
  {
    id: 2,
    title: "Class Suspension",
    message: "No classes on Sept 25 due to holiday.",
    date: "Sept 21, 2025",
    read: true,
    icon: <CampaignIcon />,
    color: "info",
  },
  {
    id: 3,
    title: "Appointment Confirmed",
    message: "Your counseling appointment with Guidance Office is confirmed.",
    date: "Sept 18, 2025",
    read: true,
    icon: <EventAvailableIcon />,
    color: "success",
  },
];

const Notifications = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>

      <Stack spacing={2}>
        {notificationsData.map((item) => (
          <Card
            key={item.id}
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              bgcolor: item.read ? "background.paper" : "action.hover",
            }}
          >
            <CardHeader
              avatar={
                <Badge
                  color="error"
                  variant="dot"
                  invisible={item.read} // shows red dot if unread
                >
                  <Avatar sx={{ bgcolor: `${item.color}.main` }}>
                    {item.icon}
                  </Avatar>
                </Badge>
              }
              title={<Typography variant="subtitle1">{item.title}</Typography>}
              subheader={item.date}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {item.message}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Notifications;
