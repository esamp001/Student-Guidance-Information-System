import React, { useState } from "react";
import PropTypes from "prop-types";
import MenuItem from "@mui/material/MenuItem";
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  TextField,
  Button,
} from "@mui/material";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const courses = [
  { value: "BSIT-1", label: "BSIT - 1st Year" },
  { value: "BSIT-2", label: "BSIT - 2nd Year" },
  { value: "BSBA-1", label: "BSBA - 1st Year" },
  { value: "BSBA-2", label: "BSBA - 2nd Year" },
];

const Login = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ textAlign: "center", mt: 3 }}>
      <Box
        component="img"
        src="/letranseal.png"
        alt="Letran Seal"
        sx={{ width: 120, height: 120, mb: 3 }}
      />
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
        Students Guidance Information System
      </Typography>

      <Paper
        sx={{
          width: { xs: "90%", sm: "500px" },
          mx: "auto",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="Login tabs"
            variant="fullWidth"
          >
            <Tab label="Login" {...a11yProps(0)} />
            <Tab label="Register" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "flex-start",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Email
            </Typography>
            <TextField
              sx={{ width: "100%" }}
              id="outlined-basic"
              label="john.doe@gmail.com"
              variant="outlined"
              size="small"
              InputProps={{
                style: { fontSize: 12 },
              }}
              InputLabelProps={{
                style: { fontSize: 12 },
              }}
            />
            <Typography variant="subtitle2" sx={{ mb: 1, mt: 3 }}>
              Password
            </Typography>
            <TextField
              sx={{ width: "100%" }}
              id="outlined-basic"
              type="password"
              label="*******"
              variant="outlined"
              size="small"
              InputProps={{
                style: { fontSize: 12 },
              }}
              InputLabelProps={{
                style: { fontSize: 12 },
              }}
            />
            <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
              <Button size="small" variant="contained">
                Login as Student
              </Button>
              <Button size="small" variant="contained">
                Login as Councilor
              </Button>
              <Button size="small" variant="contained">
                Login as Administrator
              </Button>
            </Box>
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxHeight: "350px", // set a fixed or max height
                overflowY: "auto", // enable vertical scroll
              }}
            >
              <TextField
                sx={{ mt: 1 }}
                fullWidth
                id="first-name"
                label="First Name"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                fullWidth
                id="middle-name"
                label="Middle Name"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                fullWidth
                id="last-name"
                label="Last Name"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                fullWidth
                id="student-id"
                label="Student ID / LRN"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                fullWidth
                id="email"
                type="email"
                label="Email"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                fullWidth
                id="password"
                type="password"
                label="Password"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                fullWidth
                id="confirm-password"
                type="password"
                label="Confirm Password"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                sx={{ textAlign: "start" }}
                select
                fullWidth
                id="course-year"
                label="Course / Year Level"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              >
                {courses.map((course) => (
                  <MenuItem key={course.value} value={course.value}>
                    {course.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                id="contact-number"
                label="Contact Number (Optional)"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />
            </Box>
          </Box>
          <Button sx={{ mt: 3 }} size="Medium" variant="contained">
            Register Now
          </Button>
        </CustomTabPanel>
      </Paper>
    </Box>
  );
};

export default Login;
