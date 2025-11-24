import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
// Icon

import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format, toZonedTime } from "date-fns-tz";
import useSnackbar from "../../hooks/useSnackbar";
import { useRole } from "../../context/RoleContext";
import { sendNotification } from "../../utils/notification";

const Appointments = () => {
  // States
  const { user } = useRole();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  console.log(upcomingAppointments, "upcomingAppointments");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "", // Appointment Type
    counselor_id: "", // Selected Counselor
    counselor_user_id: "", // Counselor user id for notifications
    mode: "", // Mode of Appointment
    date: null, // Selected Date
    reason: "", // Optional reason
  });

  const timeZone = "Asia/Manila"; // Philippine Time

  const validateAppointmentForm = (formData) => {
    const { type, counselor_id, mode, date, time } = formData;

    if (!type) return "Please select an appointment type.";
    if (!counselor_id) return "Please choose a counselor.";
    if (!mode) return "Please select a mode of appointment.";
    if (!date) return "Please select a date.";

    return null; // All good
  };

  const handleConfirmFollowUp = async (appointmentId) => {
    try {
      const response = await fetch(
        `/studentAppointmentSchedRoutes/student/appointment/${appointmentId}/confirm_follow_up`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to confirm follow-up");
      }

      showSnackbar("Follow-up confirmed successfully", "success");
      loadAppointments();
      setOpen(false);
    } catch (error) {
      console.error("Error confirming follow-up:", error);
      showSnackbar("Failed to confirm follow-up", "error");
    }
  };

  const handleRejectFollowUp = async (appointmentId) => {
    try {
      const response = await fetch(
        `/studentAppointmentSchedRoutes/student/appointment/${appointmentId}/reject_follow_up`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject follow-up");
      }

      showSnackbar("Follow-up rejected successfully", "success");
      loadAppointments();
      setOpen(false);
    } catch (error) {
      console.error("Error rejecting follow-up:", error);
      showSnackbar("Failed to reject follow-up", "error");
    }
  };

  // Look for for counselors
  useEffect(() => {
    const loadCounselors = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "/studentAppointmentSchedRoutes/student/counselor_lookup",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch counselor data");
        }

        const data = await response.json();
        setCounselors(data);
      } catch (error) {
        console.error("Error loading counselors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCounselors();
  }, []);

  // Lookup for all Appointments
  const loadAppointments = async () => {
    if (!user?.id) return; // make sure user.id exists

    try {
      const response = await fetch(
        `/studentAppointmentSchedRoutes/student/appointment/lookup?userId=${user.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setUpcomingAppointments(data);
    } catch (error) {
      showSnackbar(error.message || "Failed to load appointments", "error");
    }
  };

  // Handle Request Appointment
  const handleRequestAppointment = async () => {
    try {
      // Validate the form
      const validationError = validateAppointmentForm(formData);
      if (validationError) {
        showSnackbar(validationError, "error");
        return;
      }

      // Convert date+time to ISO string
      const isoDatetime = formData.date.toISOString();

      const payload = {
        type: formData.type,
        student_id: user.id,
        counselor_id: formData.counselor_id,
        mode: formData.mode,
        datetime: isoDatetime,
        reason: formData.reason || "",
      };

      const response = await fetch(
        "/studentAppointmentSchedRoutes/student/request_appointment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      setFormData({
        type: "", // Appointment Type
        counselor_id: "", // Selected Counselor
        counselor_user_id: "", // Counselor user id for notifications
        mode: "", // Mode of Appointment
        date: null, // Selected Date
        reason: "", // Optional reason
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to request appointment");
      }

      // Fire notifications
      // 1) Notify counselor about new request (if counselor_user_id present)
      if (formData.counselor_user_id) {
        await sendNotification({
          userId: formData.counselor_user_id,
          type: "announcement",
          context: {
            title: `New ${formData.type} appointment request`,
          },
        });
      }

      // 2) Notify student confirming creation with date/time
      if (user?.id) {
        await sendNotification({
          userId: user.id,
          type: "reminder",
          context: {
            date: new Date(isoDatetime).toLocaleString("en-PH", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          },
        });
      }

      loadAppointments();
      showSnackbar("Appointment requested successfully!", "success");
    } catch (error) {
      console.error("Error requesting appointment:", error);
      showSnackbar(
        error.message || "An error occurred while requesting.",
        "error"
      );
    }
  };

  // Handle api accept reject

  const handleAcceptReschedule = async (appointment) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/studentAppointmentReschedule/appointment/accept/${appointment}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: "Confirmed Reschedule" }), // only send necessary fields
        }
      );

      if (!response.ok) throw new Error("Failed to accept reschedule");

      const updatedData = await response.json();

      showSnackbar("Reschedule accepted successfully!", "success");

      // Notify counselor about accepted reschedule
      const apptForNotify =
        upcomingAppointments.find(
          (a) => a.id === appointment || a.appointment_id === appointment
        ) || selectedAppointment;
      if (apptForNotify?.counselor_user_id) {
        await sendNotification({
          userId: apptForNotify.counselor_user_id,
          type: "announcement",
          context: { title: "Student accepted reschedule request" },
        });
      }

      // Update the UI immediately
      //  Update in-memory appointment list
      setUpcomingAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment ? { ...a, status: "Confirmed Reschedule" } : a
        )
      );

      // If you want the modal details to reflect instantly too
      setSelectedAppointment((prev) =>
        prev && (prev.id === appointment || prev.appointment_id === appointment)
          ? { ...prev, status: "Confirmed Reschedule" }
          : prev
      );
    } catch (error) {
      console.error("Error accepting reschedule:", error);
      showSnackbar("Failed to accept reschedule.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReschedule = async (appointment) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/studentAppointmentReschedule/appointment/reject/${appointment}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...appointment, status: "Rejected" }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject reschedule");

      const data = await response.json();

      showSnackbar("Reschedule rejected successfully!", "success");

      // Update appointments list
      setUpcomingAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment || a.appointment_id === appointment
            ? { ...a, status: "Rejected Reschedule" }
            : a
        )
      );

      // Update selected appointment only
      setSelectedAppointment((prev) =>
        prev && (prev.id === appointment || prev.appointment_id === appointment)
          ? { ...prev, status: "Rejected Reschedule" }
          : prev
      );
    } catch (error) {
      console.error("Error rejecting reschedule:", error);
      showSnackbar("Failed to reject reschedule.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handler for confirming counselor-initiated appointment
  const handleConfirmCounselorAppointment = async (appointment) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/studentAppointmentReschedule/appointment/confirm-counselor-initiated/${appointment}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: "Confirmed" }),
        }
      );

      if (!response.ok) throw new Error("Failed to confirm appointment");

      showSnackbar("Appointment confirmed successfully!", "success");

      // Notify counselor about confirmation
      const apptForNotify =
        upcomingAppointments.find((a) => a.id === appointment) ||
        selectedAppointment;
      if (apptForNotify?.counselor_user_id) {
        await sendNotification({
          userId: apptForNotify.counselor_user_id,
          type: "appointment_confirmed",
          context: {
            student: `${user.first_name} ${user.last_name}`,
            date: new Date(apptForNotify.datetime).toLocaleString("en-PH", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          },
        });
      }

      // Update UI
      setUpcomingAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment ? { ...a, status: "Confirmed" } : a
        )
      );

      setSelectedAppointment((prev) =>
        prev && prev.id === appointment
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

  // Handler for declining counselor-initiated appointment
  const handleDeclineCounselorAppointment = async (appointment) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/studentAppointmentReschedule/appointment/decline-counselor-initiated/${appointment}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Rejected" }),
        }
      );

      if (!response.ok) throw new Error("Failed to decline appointment");

      showSnackbar("Appointment declined.", "success");

      // Update UI - remove from list or mark as rejected
      setUpcomingAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment ? { ...a, status: "Rejected" } : a
        )
      );

      setSelectedAppointment((prev) =>
        prev && prev.id === appointment ? { ...prev, status: "Rejected" } : prev
      );

      handleClose();
    } catch (error) {
      console.error("Error declining appointment:", error);
      showSnackbar("Failed to decline appointment.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (appt) => {
    setSelectedAppointment(appt);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAppointment(null);
  };

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, []); // empty dependency ensures it runs only once

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left side */}
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Counseling Appointments
        </Typography>

        {/* Right side */}
        <Box sx={{ display: "flex", gap: 1 }}></Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Grid container spacing={4}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}
                  >
                    Request a New Appointment
                  </Typography>

                  {/* Appointment Type */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Appointment Type
                  </Typography>
                  <TextField
                    select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    fullWidth
                    size="small"
                    displayEmpty
                  >
                    <MenuItem value="">Select appointment type</MenuItem>
                    <MenuItem value="Personality Testing">
                      Personality Testing
                    </MenuItem>
                    <MenuItem value="Orientation">Orientation</MenuItem>
                    <MenuItem value="Seminar">Seminar</MenuItem>
                    <MenuItem value="Academic Counseling">
                      Academic Counseling
                    </MenuItem>
                    <MenuItem value="Referal">Referal</MenuItem>
                    <MenuItem value="Study Skills Counseling">
                      Study Skills Counseling
                    </MenuItem>
                    <MenuItem value="Time Management Counseling">
                      Time Management Counseling
                    </MenuItem>
                    <MenuItem value="Learning Difficulty Counseling">
                      Learning Difficulty Counseling
                    </MenuItem>
                    <MenuItem value="Academic Motivation Counseling">
                      Academic Motivation Counseling
                    </MenuItem>

                    <MenuItem value="Personal Counseling">
                      Personal Counseling
                    </MenuItem>
                    <MenuItem value="Emotional Stability Counseling">
                      Emotional Stability Counseling
                    </MenuItem>
                    <MenuItem value="Self-Esteem Counseling">
                      Self-Esteem Counseling
                    </MenuItem>
                    <MenuItem value="Stress Management Counseling">
                      Stress Management Counseling
                    </MenuItem>
                    <MenuItem value="Adjustment Counseling">
                      Adjustment Counseling
                    </MenuItem>

                    <MenuItem value="Peer Relationship Counseling">
                      Peer Relationship Counseling
                    </MenuItem>
                    <MenuItem value="Bullying Counseling">
                      Bullying Counseling
                    </MenuItem>
                    <MenuItem value="Teacher-Student Relationship Counseling">
                      Teacher-Student Relationship Counseling
                    </MenuItem>
                    <MenuItem value="Family Relationship Counseling">
                      Family Relationship Counseling
                    </MenuItem>

                    <MenuItem value="Career Guidance Counseling">
                      Career Guidance Counseling
                    </MenuItem>
                    <MenuItem value="Course Selection Counseling">
                      Course Selection Counseling
                    </MenuItem>
                    <MenuItem value="Work Readiness Counseling">
                      Work Readiness Counseling
                    </MenuItem>

                    <MenuItem value="Behavioral Counseling">
                      Behavioral Counseling
                    </MenuItem>
                    <MenuItem value="Crisis Intervention Counseling">
                      Crisis Intervention Counseling
                    </MenuItem>
                    <MenuItem value="Disciplinary Counseling">
                      Disciplinary Counseling
                    </MenuItem>
                  </TextField>

                  {/* Choose Counselor */}
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                    Choose Counselor
                  </Typography>
                  <TextField
                    select
                    value={formData.counselor_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        counselor_id: e.target.value,
                        counselor_user_id:
                          counselors.find(
                            (c) => String(c.id) === String(e.target.value)
                          )?.counselor_user_id || "",
                      })
                    }
                    fullWidth
                    size="small"
                    displayEmpty
                  >
                    <MenuItem value="">Select a counselor</MenuItem>
                    {counselors.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {`${c.first_name} ${c.last_name}`}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Mode of Appointment */}
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                    Mode of Appointment
                  </Typography>
                  <TextField
                    select
                    value={formData.mode}
                    onChange={(e) =>
                      setFormData({ ...formData, mode: e.target.value })
                    }
                    fullWidth
                    size="small"
                    displayEmpty
                  >
                    <MenuItem value="">Select mode</MenuItem>
                    <MenuItem value="Face-to-Face">Face-to-Face</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                  </TextField>

                  {/* Date */}
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                    Select Date
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      sx={{ width: "100%" }}
                      label="Select Date & Time"
                      value={formData.date}
                      onChange={(newDate) => {
                        if (!newDate) return;
                        // Convert to PH timezone properly
                        const phDate = toZonedTime(newDate, timeZone);
                        setFormData({ ...formData, date: phDate });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <CalendarTodayIcon
                                sx={{ mr: 1, color: "action.active" }}
                              />
                            ),
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  {/* Reason */}
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                    Reason (Optional)
                  </Typography>
                  <TextField
                    placeholder="Briefly describe the reason for your appointment (e.g., academic advising, stress management, career guidance)..."
                    fullWidth
                    multiline
                    minRows={3}
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                  />

                  {/* Button */}
                  <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    color="primary"
                    onClick={handleRequestAppointment}
                  >
                    Request Appointment
                  </Button>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6} sx={{ width: "55%" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      mb: 2,
                    }}
                  >
                    Upcoming Appointments
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      width: "100%",
                      maxHeight: 550, // set the max height for the list
                      overflowY: "auto", // enable vertical scroll
                      pr: 1, // optional padding-right to avoid scrollbar overlap
                    }}
                  >
                    {!Array.isArray(upcomingAppointments) ||
                    upcomingAppointments.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No upcoming appointments.
                      </Typography>
                    ) : (
                      upcomingAppointments.map((appt) => (
                        <Paper
                          onClick={() => handleOpen(appt)} // Click to open modal
                          key={appt.id}
                          sx={{
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            borderRadius: 3,
                            border: "2px solid",
                            borderColor: "primary.main",
                            boxShadow: 1,
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {appt.type} Appointment
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              With: {appt.counselorName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(appt.datetime).toLocaleString("en-PH", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: appt.status
                                  ?.toLowerCase()
                                  .includes("confirmed")
                                  ? "green"
                                  : appt.status
                                      ?.toLowerCase()
                                      .includes("rejected")
                                  ? "red"
                                  : "orange",
                              }}
                            >
                              {appt.status || "Pending"}
                            </Typography>
                          </Box>
                        </Paper>
                      ))
                    )}
                  </Box>
                  <Dialog
                    open={open}
                    onClose={handleClose}
                    maxWidth="sm"
                    fullWidth
                  >
                    <DialogTitle>Appointment Details</DialogTitle>
                    <DialogContent dividers>
                      {selectedAppointment ? (
                        <>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {selectedAppointment.type || "N/A"} Appointment
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Counselor:</strong>{" "}
                            {selectedAppointment.counselorName || "N/A"}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Date & Time:</strong>{" "}
                            {selectedAppointment.datetime
                              ? new Date(
                                  selectedAppointment.datetime
                                ).toLocaleString("en-PH", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "N/A"}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Status:</strong>{" "}
                            {selectedAppointment.status || "Pending"}
                          </Typography>

                          {selectedAppointment.status ===
                            "Pending Reschedule" && (
                            <Box
                              sx={{
                                p: 2,
                                mb: 2,
                                mt: 2,
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                backgroundColor: "#f9f9f9",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  width: "100%",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="body1">
                                  Counselor request for reschedule, do you want
                                  to accept?
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Button
                                  onClick={() =>
                                    handleAcceptReschedule(
                                      selectedAppointment.id
                                    )
                                  }
                                  variant="contained"
                                  color="primary"
                                >
                                  Accept
                                </Button>

                                <Button
                                  onClick={() =>
                                    handleRejectReschedule(
                                      selectedAppointment.id
                                    )
                                  }
                                  variant="outlined"
                                  color="error"
                                >
                                  Reject
                                </Button>
                              </Box>
                            </Box>
                          )}

                          {selectedAppointment.status ===
                            "Pending Confirmation" && (
                            <Box
                              sx={{
                                p: 2,
                                mb: 2,
                                mt: 2,
                                border: "1px solid #2196f3",
                                borderRadius: 2,
                                backgroundColor: "#e3f2fd",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  width: "100%",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="body1" fontWeight={600}>
                                  Your counselor has requested this appointment.
                                  Would you like to confirm?
                                </Typography>
                              </Box>
                              {selectedAppointment.reason && (
                                <Box sx={{ px: 1 }}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Reason:</strong>{" "}
                                    {selectedAppointment.reason}
                                  </Typography>
                                </Box>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Button
                                  onClick={() =>
                                    handleConfirmCounselorAppointment(
                                      selectedAppointment.id
                                    )
                                  }
                                  variant="contained"
                                  color="success"
                                >
                                  Confirm
                                </Button>

                                <Button
                                  onClick={() =>
                                    handleDeclineCounselorAppointment(
                                      selectedAppointment.id
                                    )
                                  }
                                  variant="outlined"
                                  color="error"
                                >
                                  Decline
                                </Button>
                              </Box>
                            </Box>
                          )}

                          {selectedAppointment.status === "Follow-up" && (
                            <Box
                              sx={{
                                p: 2,
                                mb: 2,
                                mt: 2,
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                backgroundColor: "#f9f9f9",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  width: "100%",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="body1">
                                  Counselor request for follow-up, do you want
                                  to accept?
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Button
                                  onClick={() =>
                                    handleConfirmFollowUp(
                                      selectedAppointment.id
                                    )
                                  }
                                  variant="contained"
                                  color="primary"
                                >
                                  Confirm Follow-up
                                </Button>

                                <Button
                                  onClick={() =>
                                    handleRejectFollowUp(selectedAppointment.id)
                                  }
                                  variant="outlined"
                                  color="error"
                                >
                                  Reject
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </>
                      ) : (
                        <Typography>No appointment selected.</Typography>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose}>Close</Button>
                      {/* Optional: add actions like */}
                      {/* <Button variant="contained" color="primary">Reschedule</Button> */}
                    </DialogActions>
                  </Dialog>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </LocalizationProvider>
      </Box>
      {SnackbarComponent}
    </Box>
  );
};

export default Appointments;
