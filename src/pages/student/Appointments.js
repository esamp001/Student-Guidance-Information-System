import React from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
} from "@mui/material";
// Icon

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const Appointments = () => {
  const [date, setDate] = React.useState(null);
  const [time, setTime] = React.useState("");

  const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
  ];

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

                  {/* Date */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Select Date
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      sx={{ width: "100%" }}
                      value={date}
                      onChange={(newDate) => setDate(newDate)}
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

                  {/* Time */}
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                    Select Time
                  </Typography>
                  <TextField
                    select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    fullWidth
                    size="small"
                    displayEmpty
                  >
                    <MenuItem value="">Select a time slot</MenuItem>
                    {timeSlots.map((slot, idx) => (
                      <MenuItem key={idx} value={slot}>
                        {slot}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Reason */}
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                    Reason (Optional)
                  </Typography>
                  <TextField
                    placeholder="Briefly describe the reason for your appointment (e.g., academic advising, stress management, career guidance)..."
                    fullWidth
                    multiline
                    minRows={3}
                  />

                  {/* Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    color="primary"
                  >
                    Request Appointment
                  </Button>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}
                  >
                    Upcoming Appointments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No appointments scheduled for this view.
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </LocalizationProvider>
      </Box>
    </Box>
  );
};

export default Appointments;
