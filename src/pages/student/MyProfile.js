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
} from "@mui/material";
// Icon
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";

const MyProfile = () => {
  const courses = [
    { name: "Introduction to Programming", grade: "A" },
    { name: "Calculus I", grade: "B+" },
    { name: "English Composition", grade: "A-" },
    { name: "Linear Algebra", grade: "A" },
    { name: "Data Structures", grade: "B" },
    { name: "Physics I", grade: "C+" },
  ];

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

            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Edit Basic Information
            </Button>
          </Box>

          <Divider />

          {/* Info Section */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Full Name
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                Alex Johnson
              </Typography>

              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1">
                    alex.j@example.com
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
                S12345
              </Typography>

              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Phone
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle1">123-456-7890</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
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

            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Edit Academic Records
            </Button>
          </Box>

          <Divider />

          {/* Academic Info */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Current GPA
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              3.75
            </Typography>

            <Typography variant="body2" color="textSecondary" gutterBottom>
              Courses Taken
            </Typography>
            <List dense>
              {courses.map((course, index) => (
                <ListItem key={index} sx={{ pl: 2 }}>
                  <ListItemText
                    primary={`${course.name} (${course.grade})`}
                    primaryTypographyProps={{ variant: "subtitle1" }}
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
            Alex is a highly engaged student, consistently participating in
            class discussions and demonstrating strong leadership qualities in
            group projects. No disciplinary issues on record. Shows great
            potential in STEM fields.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyProfile;
