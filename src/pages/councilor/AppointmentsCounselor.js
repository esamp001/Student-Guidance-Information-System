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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  Tab,
  Tabs,
  Stack,
  MenuItem,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import useSnackbar from "../../hooks/useSnackbar";
import { useRole } from "../../context/RoleContext";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { sendNotification } from "../../utils/notification";

const AppointmentsCounselor = () => {
  const [selected, setSelected] = useState(null);
  const [selectedAssigned, setSelectedAssigned] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { user } = useRole();
  const [open, setOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(
    selected ? new Date(selected.datetime) : null
  );
  const [activeTab, setActiveTab] = useState(0); // 0 = All, 1 = Assigned to you

  // Counselor-initiated appointment states
  const [studentsFromCaseRecords, setStudentsFromCaseRecords] = useState([]);
  const [createAppointmentDialog, setCreateAppointmentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    type: "",
    mode: "",
    datetime: null,
    reason: "",
  });

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const handleSave = async (selected) => {
    console.log(selected, "selected");
    try {
      const response = await fetch(
        `/appointmentRequest/${selected.appointment_id}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Pending Reschedule",
            rescheduled_time: selectedDateTime.toISOString(), // ISO for safety
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }

      const data = await response.json();

      // update local state so UI refreshes immediately
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === selected.appointment_id
            ? {
                ...appt,
                status: "Pending Reschedule",
                datetime: selectedDateTime, // keep this up to date
                datetime_readable: selectedDateTime.toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
              }
            : appt
        )
      );

      setOpen(false);
      showSnackbar("Reschedule request sent!", "success");

      // Notify student about reschedule request
      await sendNotification({
        userId: selected.student_id,
        type: "reminder",
        context: {
          date: new Date(selectedDateTime).toLocaleString("en-PH", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        },
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      showSnackbar("Failed to update appointment.", "error");
    }
  };

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

  // Fetch students from guidance case records (for counselor-initiated appointments)
  useEffect(() => {
    if (!user.id || activeTab !== 1) return;

    const fetchStudentsFromCaseRecords = async () => {
      try {
        const response = await fetch(
          `/adminGuidanceCaseRecords/counselor/${user.id}/students-without-appointments`
        );

        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();
        setStudentsFromCaseRecords(data);
      } catch (err) {
        console.error("Error fetching students from case records:", err);
      }
    };

    fetchStudentsFromCaseRecords();
  }, [user.id, activeTab]);

  //  When the appointment changes, update the picker
  useEffect(() => {
    if (selected && selected.datetime) {
      setSelectedDateTime(new Date(selected.datetime));
    }
  }, [selected]);

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
      // Send notification (appointment confirmed reminder)
      await sendNotification({
        userId: appointment.student_id,
        type: "appointment_confirmed",
        context: {
          date: appointment.datetime
            ? new Date(appointment.datetime).toLocaleString("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : appointment.datetime_readable || "the scheduled date",
        },
      });

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

  const handleReject = async (appointment) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/appointmentRequest/appointments/reject/${appointment.appointment_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...appointment, status: "Rejected" }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject appointment");

      showSnackbar("Appointment rejected successfully!", "success");

      // Notify student about rejection
      await sendNotification({
        userId: appointment.student_id,
        type: "message",
        context: { sender: "Counselor" },
      });

      // Update appointments list
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointment_id === appointment.appointment_id
            ? { ...a, status: "Rejected" }
            : a
        )
      );

      // Update selected appointment only
      setSelected((prev) =>
        prev && prev.appointment_id === appointment.appointment_id
          ? { ...prev, status: "Rejected" }
          : prev
      );
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      showSnackbar("Failed to reject appointment.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleted = async (appointment) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/appointmentRequest/appointments/completed/${appointment.appointment_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...appointment, status: "Completed" }),
        }
      );

      if (!response.ok) throw new Error("Failed to make completed appointment");

      showSnackbar("Appointment confirmed successfully!", "success");

      // Notify student about completion
      await sendNotification({
        userId: appointment.student_id,
        type: "message",
        context: { sender: "Counselor" },
      });

      // Update appointments list
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointment_id === appointment.appointment_id
            ? { ...a, status: "Completed" }
            : a
        )
      );

      // Update selected appointment only
      setSelected((prev) =>
        prev && prev.appointment_id === appointment.appointment_id
          ? { ...prev, status: "Completed" }
          : prev
      );
    } catch (error) {
      console.error("Error confirming appointment:", error);
      showSnackbar("Failed to confirm appointment.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (activeTab === 0) return true; // All appointments
    if (activeTab === 1) return appt.counselor_id === user.id; // Assigned to you
    return true;
  });

  // Handler for opening create appointment dialog
  const handleOpenCreateAppointment = (student) => {
    setSelectedStudent(student);
    setCreateAppointmentDialog(true);
    setAppointmentForm({
      type: "",
      mode: "",
      datetime: null,
      reason: "",
    });
  };

  // Handler for creating counselor-initiated appointment
  const handleCreateAppointment = async () => {
    if (
      !appointmentForm.type ||
      !appointmentForm.mode ||
      !appointmentForm.datetime ||
      !appointmentForm.reason
    ) {
      showSnackbar("Please fill in all fields", "error");
      return;
    }

    try {
      const response = await fetch(
        "/adminGuidanceCaseRecords/counselor-initiate-appointment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: selectedStudent.student_id,
            counselor_user_id: user.id, // Pass user ID, backend will look up counselor ID
            case_id: selectedStudent.case_id,
            type: appointmentForm.type,
            mode: appointmentForm.mode,
            datetime: appointmentForm.datetime,
            reason: appointmentForm.reason,
            status: "Pending Confirmation",
          }),
        }
      );

      if (response.ok) {
        showSnackbar(
          "Appointment request sent to student successfully!",
          "success"
        );
        setCreateAppointmentDialog(false);

        // Notify the student
        await sendNotification({
          userId: selectedStudent.student_id,
          type: "appointment_request",
          context: {
            counselor: `${user.first_name} ${user.last_name}`,
            date: new Date(appointmentForm.datetime).toLocaleString("en-PH", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          },
        });
      } else {
        showSnackbar("Failed to send appointment request", "error");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      showSnackbar("Error creating appointment", "error");
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

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="All Appointments" />
        <Tab label="Assigned to You" />
      </Tabs>

      {/* Flex Layout */}
      {activeTab === 0 && (
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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
                              ? theme.palette.warning.light // soft orange/yellow
                              : appt.status === "Confirmed"
                              ? theme.palette.info.main // blue tone for confirmed
                              : appt.status === "Confirmed Reschedule"
                              ? theme.palette.success.light // lighter green tone
                              : appt.status === "Completed"
                              ? "green" // clean solid green for completed
                              : appt.status === "Rejected"
                              ? theme.palette.error.main // red for rejection
                              : appt.status === "Pending Reschedule"
                              ? theme.palette.primary.main // main brand color for pending reschedules
                              : appt.status === "Follow-up"
                              ? theme.palette.secondary.main // secondary color for follow-up
                              : theme.palette.grey[500],
                          color: "#fff",
                          fontWeight: 600,
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
                          <Button
                            onClick={() => handleReject(selected)}
                            variant="outlined"
                            color="error"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {selected.status === "Follow-up" && (
                        <Button
                          onClick={() => handleApprove(selected)}
                          variant="contained"
                          color="primary"
                        >
                          Confirm Follow-up
                        </Button>
                      )}

                      {selected.status?.toLowerCase().includes("confirmed") && (
                        <>
                          <Button
                            variant="outlined"
                            color="warning"
                            onClick={handleClickOpen}
                          >
                            Reschedule
                          </Button>

                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleCompleted(selected)}
                          >
                            Mark as Completed
                          </Button>

                          {/* Reschedule dialog */}
                          <Dialog
                            open={open}
                            onClose={handleClose}
                            sx={{
                              "& .MuiDialog-paper": {
                                position: "absolute",
                                top: "10%", // distance from top
                                margin: 0,
                                transform: "none",
                              },
                            }}
                          >
                            <DialogTitle>Reschedule Appointment</DialogTitle>

                            <DialogContent
                              sx={{
                                height: 100,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                position: "relative",
                              }}
                            >
                              <LocalizationProvider
                                dateAdapter={AdapterDateFns}
                              >
                                <DateTimePicker
                                  label="Select new date & time"
                                  value={selectedDateTime}
                                  onChange={(newValue) =>
                                    setSelectedDateTime(newValue)
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      fullWidth
                                      sx={{ mt: 2 }}
                                      InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <IconButton>
                                              <CalendarTodayIcon />
                                            </IconButton>
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  )}
                                />
                              </LocalizationProvider>
                            </DialogContent>

                            <DialogActions>
                              <Button onClick={handleClose}>Cancel</Button>
                              <Button
                                onClick={() => handleSave(selected)}
                                variant="contained"
                                color="warning"
                              >
                                Save
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </>
                      )}
                    </Box>
                  </>
                ) : (
                  <Box textAlign="center" sx={{ alignItems: "center" }} py={4}>
                    <Typography variant="h6" color="text.secondary">
                      No appointments selected yet.
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
      )}

      {activeTab === 1 && (
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            flexDirection: "column",
          }}
        >
          {/* Left side: Students from case records */}
          <Box sx={{ flex: "1 1 300px", minWidth: 300 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Students from Case Records
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {studentsFromCaseRecords.length} students
                  </Typography>
                </Box>
                <List
                  sx={{
                    borderRadius: 2,
                    height: 400,
                    overflowY: "auto",
                    p: 1,
                  }}
                >
                  {studentsFromCaseRecords.length > 0 ? (
                    studentsFromCaseRecords.map((student) => (
                      <ListItem
                        key={student.student_id}
                        button
                        onClick={() => setSelectedAssigned(student)}
                        sx={{
                          cursor: "pointer",
                          borderRadius: 2,
                          mb: 1,
                          bgcolor:
                            selectedAssigned?.student_id === student.student_id
                              ? "grey.100"
                              : "transparent",
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography fontWeight="bold">
                              {`${student.first_name} ${
                                student.middle_name
                                  ? student.middle_name + " "
                                  : ""
                              }${student.last_name}`}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2">
                                {student.student_no}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Case: {student.case_type}
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label="No Appointment"
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.grey[400],
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body2" color="text.secondary">
                        No students found without appointments
                      </Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Right side: Student details and create appointment */}
          <Box sx={{ flex: "2 1 500px", minWidth: 300 }}>
            <Card sx={{ borderRadius: 3, minHeight: "300px" }}>
              <CardContent>
                {selectedAssigned ? (
                  (console.log(selectedAssigned, "selectedAssigned"),
                  (
                    <>
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Student Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PersonIcon color="action" />
                        <Typography>
                          {`${selectedAssigned.first_name} ${
                            selectedAssigned.middle_name
                              ? selectedAssigned.middle_name + " "
                              : ""
                          }${selectedAssigned.last_name}`}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Student No: {selectedAssigned.student_no}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Case Type: {selectedAssigned.case_type}
                        </Typography>
                      </Box>

                      {selectedAssigned.summary && (
                        <Box mb={2}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            gutterBottom
                          >
                            Case Summary:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedAssigned.summary}
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />

                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() =>
                          handleOpenCreateAppointment(selectedAssigned)
                        }
                        startIcon={<EventIcon />}
                      >
                        Create Appointment Request
                      </Button>
                    </>
                  ))
                ) : (
                  <Box textAlign="center" sx={{ alignItems: "center" }} py={4}>
                    <Typography variant="h6" color="text.secondary">
                      No student selected yet.
                    </Typography>
                    <Typography variant="subtitle2">
                      Please select a student to create an appointment request.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Create Appointment Dialog */}
      <Dialog
        open={createAppointmentDialog}
        onClose={() => setCreateAppointmentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Appointment Request</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Student"
              value={
                selectedStudent
                  ? `${selectedStudent.first_name} ${
                      selectedStudent.middle_name
                        ? selectedStudent.middle_name + " "
                        : ""
                    }${selectedStudent.last_name}`
                  : ""
              }
              disabled
              fullWidth
            />

            <TextField
              select
              label="Appointment Type"
              value={appointmentForm.type}
              onChange={(e) =>
                setAppointmentForm({ ...appointmentForm, type: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="Counseling">Counseling</MenuItem>
              <MenuItem value="Follow-up">Follow-up</MenuItem>
              <MenuItem value="Academic Support">Academic Support</MenuItem>
              <MenuItem value="Behavioral">Behavioral</MenuItem>
            </TextField>

            <TextField
              select
              label="Mode"
              value={appointmentForm.mode}
              onChange={(e) =>
                setAppointmentForm({ ...appointmentForm, mode: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="Face-to-face">Face-to-face</MenuItem>
            </TextField>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Select Date & Time"
                value={appointmentForm.datetime}
                onChange={(newValue) =>
                  setAppointmentForm({ ...appointmentForm, datetime: newValue })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton>
                            <CalendarTodayIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            <TextField
              label="Reason / Notes"
              value={appointmentForm.reason}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  reason: e.target.value,
                })
              }
              fullWidth
              multiline
              rows={3}
              placeholder="Enter reason for this appointment..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAppointmentDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateAppointment}
            variant="contained"
            color="primary"
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {SnackbarComponent}
    </Box>
  );
};

export default AppointmentsCounselor;
