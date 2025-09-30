import React from "react";
import { Box, Card, CardContent, Typography, Grid, Badge } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function AdminDashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Welcome Admin
      </Typography>

      <Grid container spacing={3}>
        {/* Student Management Summary */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, width: 300 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PeopleIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h6">Students</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Registered: 1,250
                </Typography>
                <Typography variant="body2" color="success.main">
                  Active: 1,180
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Guidance Records Summary */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, width: 300 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <HistoryEduIcon color="secondary" fontSize="large" />
              <Box>
                <Typography variant="h6">Guidance Records</Typography>
                <Typography variant="body2" color="text.secondary">
                  Open Cases: 45
                </Typography>
                <Typography variant="body2" color="primary">
                  Resolved: 120
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications & Alerts */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, width: 300 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Badge badgeContent={7} color="error">
                <NotificationsIcon color="action" fontSize="large" />
              </Badge>
              <Box>
                <Typography variant="h6">Notifications</Typography>
                <Typography variant="body2" color="text.secondary">
                  3 New Alerts Today
                </Typography>
                <Typography variant="body2" color="warning.main">
                  Pending Actions: 4
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
