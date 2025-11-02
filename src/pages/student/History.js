import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TableHead,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRole } from "../../context/RoleContext";
import useSnackbar from "../../hooks/useSnackbar";

const sessions = [
  {
    date: "October 26, 2023",
    counselor: "Dr. Emily Chen",
    type: "Academic Guidance",
    concern: "Course selection pressure",
    status: "Completed",
  },
  {
    date: "September 12, 2023",
    counselor: "Mr. David Miller",
    type: "Stress Management",
    concern: "Exam anxiety and sleep issues",
    status: "Completed",
  },
  {
    date: "August 18, 2023",
    counselor: "Ms. Sarah Jones",
    type: "Career Planning",
    concern: "Future career uncertainty",
    status: "In Progress",
  },
  {
    date: "July 05, 2023",
    counselor: "Dr. Emily Chen",
    type: "Personal Counseling",
    concern: "Adjustment to university life",
    status: "Completed",
  },
  {
    date: "June 20, 2023",
    counselor: "Mr. David Miller",
    type: "Time Management",
    concern: "Procrastination and missed deadlines",
    status: "Completed",
  },
  {
    date: "May 10, 2023",
    counselor: "Ms. Sarah Jones",
    type: "Conflict Resolution",
    concern: "Roommate disagreement",
    status: "Pending Follow-up",
  },
];

const getStatusChip = (status) => {
  switch (status) {
    case "Completed":
      return <Chip label="Completed" color="success" size="small" />;
    case "In Progress":
      return <Chip label="In Progress" color="info" size="small" />;
    case "Pending":
      return <Chip label="Pending" color="warning" size="small" />;
    case "Pending Follow-up":
      return <Chip label="Pending Follow-up" color="warning" size="small" />;
    default:
      return <Chip label={status} size="small" />;
  }
};

const History = () => {
  // States
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  //
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { user } = useRole();

  // Lookup Records
  useEffect(() => {
    const loadCounselingHistory = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/studentCounselingHistory/student/counseling_history?student_id=${user.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          showSnackbar("Failed to fetch counseling history.", "error");
          throw new Error("Failed to fetch counseling history");
        }

        const data = await response.json();
        setRecords(data);

        if (data.length === 0) {
          showSnackbar("No counseling history found.", "warning");
        }
      } catch (error) {
        showSnackbar("Server error while loading records.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadCounselingHistory();
  }, [user.id]);

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Counseling History
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date of Session</TableCell>
              <TableCell>Counselor Name</TableCell>
              <TableCell>Type of Counseling</TableCell>
              <TableCell>Concern/Issue</TableCell>
              <TableCell>Outcome/Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((session, index) => (
              <TableRow key={index}>
                <TableCell>{session.datetime || "N/A"}</TableCell>
                <TableCell>
                  {[session.first_name, session.last_name]
                    .filter(Boolean)
                    .join(" ") || "N/A"}
                </TableCell>
                <TableCell>{session.type || "N/A"}</TableCell>
                <TableCell>{session.reason || "N/A"}</TableCell>
                <TableCell>
                  {getStatusChip(session.status || "Unknown")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default History;
