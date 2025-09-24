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
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import SchoolIcon from "@mui/icons-material/School";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";

const historyData = [
  {
    id: 1,
    title: "Counseling Session with Guidance Counselor",
    date: "Sept 18, 2025",
    status: "Completed",
    notes: "Discussed stress management strategies",
    icon: <PersonIcon />,
    color: "primary",
  },
  {
    id: 2,
    title: "Career Seminar: Preparing for Job Interviews",
    date: "Aug 28, 2025",
    status: "Attended",
    icon: <SchoolIcon />,
    color: "success",
  },
  {
    id: 3,
    title: "Requested Good Moral Certificate",
    date: "Jun 10, 2025",
    status: "Pending",
    icon: <DescriptionIcon />,
    color: "warning",
  },
  {
    id: 4,
    title: "Academic Advising with Registrar",
    date: "May 05, 2025",
    status: "Completed",
    icon: <EventIcon />,
    color: "primary",
  },
];

const History = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        History
      </Typography>

      <Stack spacing={2}>
        {historyData.map((item) => (
          <Card key={item.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: `${item.color}.main` }}>
                  {item.icon}
                </Avatar>
              }
              title={<Typography variant="subtitle1">{item.title}</Typography>}
              subheader={item.date}
            />
            <CardContent>
              <Chip
                label={item.status}
                color={item.color}
                size="small"
                sx={{ mb: 1 }}
              />
              {item.notes && (
                <Typography variant="body2" color="text.secondary">
                  {item.notes}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default History;
