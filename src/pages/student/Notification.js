import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// icons
import MarkChatReadTwoToneIcon from "@mui/icons-material/MarkChatReadTwoTone";
import { CalendarToday, Feedback, Info } from "@mui/icons-material";

const notifications = [
  {
    id: 1,
    title: "Appointment Confirmed!",
    description:
      "Your counseling session with Mr. David Lee on October 26th at 10:00 AM has been approved. Please prepare your topics of discussion.",
    time: "2 hours ago",
    status: "Unread",
    icon: <CalendarToday fontSize="small" />,
  },
  {
    id: 2,
    title: "New Feedback Request",
    description:
      "A feedback request regarding your recent session has been sent. Please share your experience to help us improve.",
    time: "4 hours ago",
    status: "Unread",
    icon: <Feedback fontSize="small" />,
  },
  {
    id: 3,
    title: "System Update Notification",
    description:
      "The system will undergo maintenance on Nov 15th from 2:00 AM - 4:00 AM. Services may be temporarily unavailable.",
    time: "Yesterday",
    status: "Unread",
    icon: <Info fontSize="small" />,
  },
];

const Notification = () => {
  //States
  const [filter, setFilter] = useState("");

  //Handlers
  const handleChange = (event) => {
    setFilter(event.target.value);
    // You can trigger filtering logic here
  };

  return (
    <Box>
      <Box>
        <Typography sx={{ fontWeight: 700, mb: 3 }} variant="h4">
          My Notification
        </Typography>
        <Box
          sx={{
            width: "100%",
            justifyContent: "space-between",
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Button variant="contained" endIcon={<MarkChatReadTwoToneIcon />}>
            Mark as all read
          </Button>
          <FormControl sx={{ width: "20%" }} size="small">
            <InputLabel id="filter-label">Filter by Type</InputLabel>
            <Select
              labelId="filter-label"
              id="filter-select"
              value={filter}
              label="Filter by Type"
              onChange={handleChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="appointment">Appointments</MenuItem>
              <MenuItem value="feedback">Feedback</MenuItem>
              <MenuItem value="system">System Updates</MenuItem>
              <MenuItem value="policy">Policy Updates</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {notifications.map((notif) => (
        <Card key={notif.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              {notif.icon}
              <Typography variant="subtitle1" fontWeight="bold">
                {notif.title}
              </Typography>
              <Chip
                label={notif.status}
                color={notif.status === "Unread" ? "success" : "default"}
                size="small"
              />
            </Box>
            <Typography variant="body2" mt={1}>
              {notif.description}
            </Typography>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography
                sx={{ mt: 2 }}
                variant="caption"
                color="text.secondary"
              >
                {notif.time}
              </Typography>
              <Button size="small">View Details</Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Notification;
