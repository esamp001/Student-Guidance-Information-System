import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import MenuItem from "@mui/material/MenuItem";
import useSnackbar from "../hooks/useSnackbar";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  TextField,
  Button,
} from "@mui/material";
import { useRole } from "../context/RoleContext";

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

const initialUser = {
  firstName: "",
  middleName: "",
  lastName: "",
  studentID: "",
  email: "",
  password: "",
  confirmPassword: "",
  course: "",
  contactNumber: "",
  userName: "",
};

const initialForm = {
  email: "",
  password: "",
};

const validateUser = (user) => {
  const allEmpty = Object.values(user).every(
    (value) =>
      value === null || value === undefined || value.toString().trim() === ""
  );

  if (allEmpty) {
    return "Please input fields.";
  }

  // 1. Required fields
  const requiredFields = [
    "firstName",
    "middleName",
    "lastName",
    "studentID",
    "userName",
    "email",
    "password",
    "confirmPassword",
    "course",
  ];

  for (let field of requiredFields) {
    if (!user[field] || user[field].trim() === "") {
      return `${field.replace(/([A-Z])/g, " $1")} is required`; // Makes "firstName" -> "first Name"
    }
  }

  // 2. Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.email)) {
    return "Invalid email address";
  }

  // 3. Password rules
  if (user.password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(user.password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(user.password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(user.password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(user.password)) {
    return "Password must contain at least one special character";
  }

  // 4. Password match
  if (user.password !== user.confirmPassword) {
    return "Passwords do not match";
  }

  // 5. Username validation
  if (user.userName.length < 4) {
    return "Username must be at least 4 characters";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(user.userName)) {
    return "Username can only contain letters, numbers, and underscores";
  }

  // 6. Student ID validation (numeric only)
  if (!/^\d+$/.test(user.studentID)) {
    return "Student ID must be numeric";
  }

  // 7. Contact number validation (optional)
  if (user.contactNumber && !/^\+?\d{10,15}$/.test(user.contactNumber)) {
    return "Contact Number is invalid";
  }

  return null; // No errors
};

const validateLogin = (formData) => {
  if (!formData.email) {
    return "Please enter your email";
  }

  if (!formData.password) {
    return "Please enter your password";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return "Invalid email format.";
  }

  if (formData.password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  return null;
};

const Login = () => {
  const { setUser, setRole } = useRole();
  const navigate = useNavigate();
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  // States
  const [value, setValue] = useState(0);
  const [userForm, setUserForm] = useState(initialUser);
  const [formData, setformData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleChangeUser = (event) => {
    setUserForm({
      ...userForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangeForm = (e) => {
    setformData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Fetch
  const handleRegister = async () => {
    const error = validateUser(userForm);
    if (error) {
      showSnackbar(error, "error"); // show validation error
      return; // stop submission
    }

    try {
      const response = await fetch("/registerRoutes/register/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userForm }),
      });

      if (response.ok) {
        showSnackbar("Registration successful!", "success");
        setUserForm(initialUser);
      } else {
        showSnackbar("Registration failed", "error");
      }
    } catch (error) {
      showSnackbar("Something went wrong.", "error");
    }
  };

  const handleLogin = async () => {
    const error = validateLogin(formData);
    if (error) {
      showSnackbar(error, "error"); // show validation error
      return; // stop submission
    }

    try {
      const response = await fetch("/loginRoutes/login/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();
      console.log(data, "data");

      if (response.ok && data.user) {
        showSnackbar(data.message || "Login successful!", "success");
        setformData(initialForm);

        const userRole = data.user.role;
        setUser(data.user);
        setRole(userRole);
        navigate(`/dashboard/${userRole}`);
      } else {
        showSnackbar(
          data.message || "Login failed. Please try again.",
          "error"
        );
      }
    } catch (error) {
      showSnackbar("Something went wrong.", "error");
    }
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
            {/*Login Fields */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Email
            </Typography>
            <TextField
              sx={{ width: "100%" }}
              name="email"
              value={formData.email}
              onChange={handleChangeForm}
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
              name="password"
              id="outlined-basic"
              type="password"
              value={formData.password}
              onChange={handleChangeForm}
              label="Str0nGP@ssw0rd"
              variant="outlined"
              size="small"
              InputProps={{
                style: { fontSize: 12 },
              }}
              InputLabelProps={{
                style: { fontSize: 12 },
              }}
            />
            <Box
              sx={{
                display: "flex",
                gap: 3,
                mt: 2,
                width: "100%",
              }}
            >
              <Button
                disabled={loading}
                sx={{ width: "100%" }}
                onClick={handleLogin}
                size="small"
                variant="contained"
              >
                {loading ? "Logging in..." : "Login"}
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
                maxHeight: "350px",
                overflowY: "auto",
              }}
            >
              <TextField
                name="firstName"
                value={userForm.firstName}
                onChange={handleChangeUser}
                sx={{ mt: 1 }}
                fullWidth
                label="First Name"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                name="middleName"
                value={userForm.middleName}
                onChange={handleChangeUser}
                fullWidth
                id="middle-name"
                label="Middle Name"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                name="lastName"
                value={userForm.lastName}
                onChange={handleChangeUser}
                fullWidth
                id="last-name"
                label="Last Name"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                name="studentID"
                value={userForm.studentID}
                onChange={handleChangeUser}
                fullWidth
                id="student-id"
                label="Student ID / LRN"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                name="userName"
                value={userForm.userName}
                onChange={handleChangeUser}
                fullWidth
                id="username"
                type="username"
                label="Username"
                variant="outlined"
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />

              <TextField
                name="email"
                value={userForm.email}
                onChange={handleChangeUser}
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
                name="password"
                value={userForm.password}
                onChange={handleChangeUser}
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
                name="confirmPassword"
                value={userForm.confirmPassword}
                onChange={handleChangeUser}
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
                name="course"
                value={userForm.course}
                onChange={handleChangeUser}
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
                name="contactNumber"
                value={userForm.contactNumber}
                onChange={handleChangeUser}
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
          <Button
            onClick={handleRegister}
            sx={{ mt: 3 }}
            size="Medium"
            variant="contained"
          >
            Register Now
          </Button>
        </CustomTabPanel>
      </Paper>
      {SnackbarComponent}
    </Box>
  );
};

export default Login;
