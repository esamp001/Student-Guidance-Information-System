import React from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Stack,
  Avatar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SchoolIcon from "@mui/icons-material/School";
import FavoriteIcon from "@mui/icons-material/Favorite";

const studentHistory = [
  {
    appointment: "2025-09-20 Counseling Session",
    details: [
      {
        time: "10:00 AM",
        description: "Discussed academic performance",
        type: "Counseling",
        status: "Completed",
        icon: <EventNoteIcon />,
      },
      {
        time: "10:30 AM",
        description: "Reviewed study habits",
        type: "Counseling",
        status: "Completed",
        icon: <EventNoteIcon />,
      },
    ],
  },
  {
    appointment: "2025-09-25 Workshop",
    details: [
      {
        time: "2:00 PM",
        description: "Time management strategies",
        type: "Workshop",
        status: "Completed",
        icon: <SchoolIcon />,
      },
    ],
  },
  {
    appointment: "2025-10-01 Follow-up",
    details: [
      {
        time: "11:00 AM",
        description: "Stress management progress",
        type: "Follow-up",
        status: "Pending",
        icon: <FavoriteIcon />,
      },
    ],
  },
];

const History = () => {
  return (
    <Box sx={{ maxWidth: "100%", p: 3 }}>
      <Typography sx={{ fontWeight: 700, mb: 3 }} variant="h4" gutterBottom>
        Counseling History
      </Typography>

      {studentHistory.map((session, index) => (
        <Accordion key={index} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{session.appointment}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {session.details.map((detail, idx) => (
                <Stack
                  key={idx}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ p: 1, borderRadius: 1, border: "1px solid #ddd" }}
                >
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {detail.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {detail.time}
                    </Typography>
                    <Typography variant="body1">
                      {detail.description}
                    </Typography>
                    <Chip
                      label={detail.status}
                      color={
                        detail.status === "Completed" ? "success" : "warning"
                      }
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Stack>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default History;
