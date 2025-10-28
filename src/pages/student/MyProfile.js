import React, { useEffect, useState } from "react";
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
  Skeleton,
  MenuItem,
} from "@mui/material";
// Icon
import PersonIcon from "@mui/icons-material/Person";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PhoneIcon from "@mui/icons-material/Phone";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import useSnackbar from "../../hooks/useSnackbar";
import { useRole } from "../../context/RoleContext";

const MyProfile = () => {
  // States
  const [basicInfoLoadData, setBasicInfoLoadData] = useState([]);
  const [academicRecords, setAcademicRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [totalGrades, setTotalGrades] = useState(0);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { user } = useRole();

  const gradeToPoint = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    D: 1.0,
    F: 0.0,
  };

  // Validations
  const validateFields = (data, requiredFields) => {
    const errors = [];

    requiredFields.forEach(({ key, label, type }) => {
      const value = data[key];

      // Check if empty
      if (
        value === undefined ||
        value === null ||
        value.toString().trim() === ""
      ) {
        errors.push(`${label} is required`);
        return;
      }

      // Type checks
      if (type === "integer") {
        if (isNaN(value)) {
          errors.push(`${label} must be a valid number`);
        } else if (!Number.isInteger(Number(value))) {
          errors.push(`${label} must be an integer`);
        }
      }

      if (type === "string") {
        if (typeof value !== "string") {
          errors.push(`${label} must be text`);
        }
      }
    });

    return errors;
  };

  // Handlers
  const handleChangeBasicInfo = (e) => {
    const { name, value } = e.target;
    setBasicInfoLoadData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveBasicInfo = async () => {
    const requiredFields = [
      { key: "first_name", label: "First Name", type: "string" },
      { key: "last_name", label: "Last Name", type: "string" },
      { key: "course", label: "Course", type: "string" },
      { key: "contact_no", label: "Contact Number", type: "integer" },
      { key: "student_no", label: "Student Number", type: "integer" },
    ];

    const validationErrors = validateFields(basicInfoLoadData, requiredFields);

    if (validationErrors.length > 0) {
      showSnackbar(validationErrors.join(", "), "warning");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/myProfileRoutes/basic_information/update",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId: user.id,
            ...basicInfoLoadData,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save basic information");

      const updatedData = await response.json();
      setBasicInfoLoadData(updatedData);
      setIsEditing(false);
      showSnackbar("Basic information updated successfully", "success");
    } catch (error) {
      console.error("Error saving basic info:", error);
      showSnackbar("Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  };

  const courses = [
    { name: "Introduction to Programming", grade: "A" },
    { name: "Calculus I", grade: "B+" },
    { name: "English Composition", grade: "A-" },
    { name: "Linear Algebra", grade: "A" },
    { name: "Data Structures", grade: "B" },
    { name: "Physics I", grade: "C+" },
  ];

  const handleGetAverageGrade = () => {
    // Make sure academicRecords is an array with grades
    if (!academicRecords || academicRecords.length === 0) {
      return 0;
    }

    // Map grades out of objects
    const grades = academicRecords.map((record) => record.grade);

    // Convert grades to points
    const totalPoints = grades.reduce((sum, grade) => {
      return sum + (gradeToPoint[grade] || 0);
    }, 0);

    // Compute average
    const avgPoints = totalPoints / grades.length;

    console.log(avgPoints, "avgPoints");
    setTotalGrades(avgPoints);
    return avgPoints;
  };

  // Data Look Up
  useEffect(() => {
    setLoading(true);

    const loadMyProfileLook = async () => {
      try {
        const response = await fetch(
          `/myProfileRoutes/basic_information/data/lookup?userId=${user.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch student dashboard data");
        }

        const data = await response.json();
        console.log(data, "dataxx");
        setBasicInfoLoadData(data.studentInfo); // assuming `data` is the student object
        setAcademicRecords(data.academicRecords);
      } catch (error) {
        console.error("Error loading navbar data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMyProfileLook();
  }, [user.id]);

  useEffect(() => {
    handleGetAverageGrade();
  }, [academicRecords]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        My Profile
      </Typography>
      <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Basic Information
              </Typography>
            </Box>
            {isEditing ? (
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ textTransform: "none" }}
                  onClick={handleSaveBasicInfo}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outlined"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Edit Basic Information
              </Button>
            )}
          </Box>

          <Divider />
          {/* Info Section */}
          {loading ? (
            // SKELETON LOADING STATE
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Left Column */}
              <Grid item xs={12} md={6} sx={{ width: "15%" }}>
                {/* Full Name */}
                <Typography variant="body2" color="textSecondary">
                  Full Name
                </Typography>
                <Skeleton
                  variant="text"
                  width="100%"
                  height={50}
                  sx={{ borderRadius: 1 }}
                />

                {/* Email */}
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Course
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={50}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6} sx={{ width: "15%" }}>
                {/* Student ID */}
                <Typography variant="body2" color="textSecondary">
                  Student ID
                </Typography>
                <Skeleton
                  variant="text"
                  width="100%"
                  height={50}
                  sx={{ borderRadius: 1 }}
                />

                {/* Phone */}
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Phone
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={50}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          ) : isEditing ? (
            // EDIT MODE (your text fields)
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  First Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="first_name"
                  value={basicInfoLoadData.first_name || ""}
                  onChange={handleChangeBasicInfo}
                />

                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 2 }}
                >
                  Middle Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="middle_name"
                  value={basicInfoLoadData.middle_name || ""}
                  onChange={handleChangeBasicInfo}
                />

                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 2 }}
                >
                  Last Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="last_name"
                  value={basicInfoLoadData.last_name || ""}
                  onChange={handleChangeBasicInfo}
                />

                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 2 }}
                >
                  Course
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  name="course"
                  value={basicInfoLoadData.course || ""}
                  onChange={handleChangeBasicInfo}
                >
                  <MenuItem value="">Select Course</MenuItem>
                  <MenuItem value="BSIT-1">BSIT-1</MenuItem>
                  <MenuItem value="BSIT-2">BSIT-2</MenuItem>
                  <MenuItem value="BSCS">BSCS</MenuItem>
                  <MenuItem value="BSECE">BSECE</MenuItem>
                </TextField>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Student ID
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="student_no"
                  value={basicInfoLoadData.student_no || ""}
                  onChange={handleChangeBasicInfo}
                />

                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 2 }}
                >
                  Phone
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="contact_no"
                  value={basicInfoLoadData.contact_no || ""}
                  onChange={handleChangeBasicInfo}
                />
              </Grid>
            </Grid>
          ) : (
            // VIEW MODE (your real display)
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Full Name
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {`${basicInfoLoadData.first_name} ${basicInfoLoadData.middle_name} ${basicInfoLoadData.last_name}`}
                </Typography>

                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MenuBookIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1">
                      {basicInfoLoadData.course}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Student ID
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {basicInfoLoadData.student_no}
                </Typography>

                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Phone
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1">
                      {basicInfoLoadData.contact_no || "No Contact Number"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Academic Records */}
      <Card variant="outlined" sx={{ borderRadius: 2, mt: 3 }}>
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <SchoolIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Academic Records
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Academic Info */}
          <Box sx={{ mt: 2 }}>
            <Typography
              sx={{ fontWeight: 700 }}
              variant="body1"
              color="textSecondary"
            >
              Current GPA
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={80} height={30} />
            ) : (
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {totalGrades?.toFixed(2) || "0.00"}
              </Typography>
            )}

            <Typography
              variant="body2"
              color="textSecondary"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Courses Taken
            </Typography>
            <List dense>
              {(loading
                ? // If loading, create skeletons based on expected length (or default to 3)
                  [...Array(academicRecords?.length || 3)]
                : academicRecords
              )?.map((record, index) => (
                <ListItem key={index} sx={{ pl: 2 }}>
                  <ListItemText
                    primary={
                      loading ? (
                        <Skeleton variant="text" width="60%" height={40} />
                      ) : (
                        `${record.course} (${record.grade})`
                      )
                    }
                    primaryTypographyProps={{
                      variant: "subtitle1",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </CardContent>
      </Card>

      {/* Behavioral Notes */}
      <Card sx={{ borderRadius: 3, boxShadow: 1, mt: 3 }}>
        <CardContent>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Behavioral Notes
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Notes Content */}
          <Typography variant="body2" color="text.secondary">
            {academicRecords?.[0]?.overall_note ||
              "No overall note available for this student."}
          </Typography>
        </CardContent>
      </Card>
      {SnackbarComponent}
    </Box>
  );
};

export default MyProfile;
