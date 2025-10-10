import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  TextField,
  Button,
  IconButton,
} from "@mui/material";

// Icon
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const CounselorMessage = () => {
  return (
    <Paper sx={{ display: "flex", height: 770 }}>
      <Box
        sx={{
          width: "30%",
          p: 2,
          borderRight: ".5px solid",
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>Conversations</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "center" }}>
          <Avatar></Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>John Doe</Typography>
            <Typography
              sx={{
                width: 200,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: 12,
              }}
            >
              Sure, let's connect next week. I’ll share the calendar invite and
              agenda shortly after confirming the time.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "center" }}>
          <Avatar></Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>Alexander Sprite</Typography>
            <Typography
              sx={{
                width: 200,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: 12,
              }}
            >
              Sure, let's connect next week. I’ll share the calendar invite and
              agenda shortly after confirming the time.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "center" }}>
          <Avatar></Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>Juan Dela Cruz</Typography>
            <Typography
              sx={{
                width: 200,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: 12,
              }}
            >
              Sure, let's connect next week. I’ll share the calendar invite and
              agenda shortly after confirming the time.
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          width: "70%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            borderBottom: "1px solid",
            height: 70,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "background.paper",
          }}
        >
          {/* User Info */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar />
            <Box sx={{ ml: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>John Doe</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Counselor
              </Typography>
            </Box>
          </Box>

          {/* Action Button with Icon */}
          <IconButton color="primary">
            <InfoOutlinedIcon />
          </IconButton>
        </Box>
        {/* Messages History */}
        <Box
          sx={{
            flexGrow: 1, // fills space between header and input
            overflowY: "auto", // scroll if too many messages
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Example Message (Other User) */}
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <Avatar sx={{ mr: 1 }} />
            <Box>
              <Typography sx={{ fontWeight: 700 }}>John Doe</Typography>
              <Typography>Hello! How can I help you today?</Typography>
              <Typography variant="caption" color="text.secondary">
                10:30 AM
              </Typography>
            </Box>
          </Box>

          {/* Example Message (You) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "row-reverse", // right align
            }}
          >
            <Avatar sx={{ ml: 1 }} />
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontWeight: 700 }}>You</Typography>
              <Typography>I need some advice on my application.</Typography>
              <Typography variant="caption" color="text.secondary">
                10:32 AM
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            height: 70,
            p: 2,
            alignItems: "center",
            display: "flex",
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Type a message..."
            size="small"
            fullWidth
            sx={{ mr: 1 }}
          />
          <Button variant="contained">Send</Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CounselorMessage;
