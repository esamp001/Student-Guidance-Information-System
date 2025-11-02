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
} from "@mui/material";
// Icon

import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format, toZonedTime } from "date-fns-tz";
import useSnackbar from "../../hooks/useSnackbar";
import { useRole } from "../../context/RoleContext";

const upcomingAppointments = [
  {
    id: 1,
    type: "Academic",
    counselorName: "John Doe",
    datetime: "2025-10-26T10:30:00+08:00",
    status: "Confirmed",
  },
  {
    id: 2,
    type: "Personal",
    counselorName: "Jane Smith",
    datetime: "2025-10-27T14:00:00+08:00",
    status: "Pending",
  },
];

const Appointments = () => {
  // States
  const { user } = useRole();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  // const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [formData, setFormData] = useState({
    type: "", // Appointment Type
    counselor_id: "", // Selected Counselor
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
        mode: "", // Mode of Appointment
        date: null, // Selected Date
        reason: "", // Optional reason
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to request appointment");
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
                    <MenuItem value="Academic Counseling">
                      Academic Counseling
                    </MenuItem>
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
                      setFormData({ ...formData, counselor_id: e.target.value })
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
                          key={appt.id}
                          sx={{
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
                                color:
                                  appt.status?.toLowerCase() === "confirmed"
                                    ? "green"
                                    : "orange",
                              }}
                            >
                              {appt.status}
                            </Typography>
                          </Box>
                        </Paper>
                      ))
                    )}
                  </Box>
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
