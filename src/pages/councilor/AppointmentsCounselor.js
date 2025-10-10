import React, { useState } from "react";
import theme from "../../theme";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import Appointments from "./../student/Appointments";

const AppointmentsCounselor = () => {
  const [selected, setSelected] = useState(null);

  const appointments = [
    {
      id: 1,
      student: "Alice Johnson",
      type: "Academic Counseling",
      date: "2024-07-25",
      time: "10:00 AM",
      status: "Pending",
    },
    {
      id: 2,
      student: "Charlie Davis",
      type: "Behavioral Support",
      date: "2024-07-26",
      time: "02:30 PM",
      status: "Confirmed",
    },
    {
      id: 3,
      student: "Diana Miller",
      type: "Career Guidance",
      date: "2024-07-27",
      time: "11:00 AM",
      status: "Completed",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Counselor Appointments
        </Typography>
      </Box>

      {/* Flex Layout */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          flexDirection: "column",
        }}
      >
        {/* Left side: list of appointments */}
        <Box sx={{ flex: "1 1 300px", minWidth: 300 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}
              >
                Appointment Requests
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List>
                {appointments.map((appt) => (
                  <ListItem
                    key={appt.id}
                    button
                    onClick={() => setSelected(appt)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      mb: 1,
                      bgcolor:
                        selected?.id === appt.id ? "grey.100" : "transparent",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography fontWeight="bold">
                          {appt.student}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">{appt.type}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appt.date} • {appt.time}
                          </Typography>
                        </>
                      }
                    />
                    <Chip
                      label={appt.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          appt.status === "Pending"
                            ? theme.palette.primary.tertiary
                            : appt.status === "Confirmed"
                            ? theme.palette.primary.red
                            : appt.status === "Completed"
                            ? theme.palette.primary.secondary // or any color you want for Completed
                            : theme.palette.grey[500],
                        color: "#fff",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Right side: details of selected appointment */}
        <Box sx={{ flex: "2 1 500px", minWidth: 300 }}>
          <Card sx={{ borderRadius: 3, minHeight: "300px" }}>
            <CardContent>
              {selected ? (
                <>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Appointment Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonIcon color="action" />
                    <Typography>{selected.student}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EventIcon color="action" />
                    <Typography>{selected.date}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <AccessTimeIcon color="action" />
                    <Typography>{selected.time}</Typography>
                  </Box>

                  <Chip
                    label={selected.type}
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Status: {selected.status}
                  </Typography>

                  <Box display="flex" gap={1}>
                    {selected.status === "Pending" && (
                      <>
                        <Button variant="contained" color="success">
                          Approve
                        </Button>
                        <Button variant="outlined" color="error">
                          Reject
                        </Button>
                      </>
                    )}
                    {selected.status === "Confirmed" && (
                      <Button variant="outlined" color="warning">
                        Reschedule
                      </Button>
                    )}
                  </Box>
                </>
              ) : (
                <Box textAlign="center" sx={{ alignItems: "center" }} py={4}>
                  <Typography variant="h6" color="text.secondary">
                    No appointments yet.
                  </Typography>
                  <Typography variant="subtitle2">
                    Please select an appointment to view its details.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AppointmentsCounselor;
