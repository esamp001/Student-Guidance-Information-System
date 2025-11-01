import React, { useState, useEffect } from "react";
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
import useSnackbar from "../../hooks/useSnackbar";
import { useRole } from "../../context/RoleContext";

const AppointmentsCounselor = () => {
  const [selected, setSelected] = useState(null);
  console.log(selected, "selected");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { user } = useRole();

  useEffect(() => {
    if (!user.id) return; // Don't fetch if no ID

    const fetchAppointments = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/appointmentRequest/counselor/appointments_lookup?counselorUserId=${user.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data); // set the fetched appointments
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleApprove = async (appointment) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/appointmentRequest/appointments/${appointment.appointment_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...appointment, status: "Confirmed" }),
        }
      );

      if (!response.ok) throw new Error("Failed to confirm appointment");

      const data = await response.json();

      showSnackbar("Appointment confirmed successfully!", "success");

      // Update appointments list
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointment_id === appointment.appointment_id
            ? { ...a, status: "Confirmed" }
            : a
        )
      );

      // Update selected appointment only
      setSelected((prev) =>
        prev && prev.appointment_id === appointment.appointment_id
          ? { ...prev, status: "Confirmed" }
          : prev
      );
    } catch (error) {
      console.error("Error confirming appointment:", error);
      showSnackbar("Failed to confirm appointment.", "error");
    } finally {
      setLoading(false);
    }
  };

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

              <List
                sx={{
                  borderRadius: 2,
                  height: 400, // fixed height in px (adjust as needed)
                  overflowY: "auto", // vertical scroll when content exceeds height
                  p: 1, // optional padding
                }}
              >
                {appointments.map((appt) => (
                  <ListItem
                    key={appt.appointment_id}
                    button
                    onClick={() => setSelected(appt)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      mb: 1,
                      bgcolor:
                        selected?.appointment_id === appt.appointment_id
                          ? "grey.100"
                          : "transparent",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography fontWeight="bold">
                          {`${appt.student_first_name} ${
                            appt.student_middle_name
                              ? appt.student_middle_name + " "
                              : ""
                          }${appt.student_last_name}`}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">{appt.type}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appt.datetime_readable}
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
                            ? theme.palette.primary.secondary
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
                    <Typography>
                      {`${selected.student_first_name} ${
                        selected.student_middle_name
                          ? selected.student_middle_name + " "
                          : ""
                      }${selected.student_last_name}`}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EventIcon color="action" />
                    <Typography>{selected.datetime_readable}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <AccessTimeIcon color="action" />
                    <Typography>
                      {selected.datetime_readable.split(" - ")[1]}
                    </Typography>
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
                        <Button
                          onClick={() => handleApprove(selected)}
                          variant="contained"
                          color="success"
                        >
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
