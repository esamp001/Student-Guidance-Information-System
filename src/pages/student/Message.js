import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  TextField,
  Button,
  IconButton,
  Divider,
  InputAdornment,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import socket from "../../hooks/socket";
import { useRole } from "../../context/RoleContext";

const Message = () => {
  const { user } = useRole();
  const [messages, setMessages] = useState([]);
  const [conversationList, setConversationList] = useState([]);
  console.log(conversationList, "conversationList");
  console.log(messages, "messages");
  const [text, setText] = useState("");
  console.log(text, "text");

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    if (user.id) {
      socket.emit("register_user", user.id);
    }
  }, [user.id]);

  useEffect(() => {
    if (!user.id) return; // don't fetch if no userId

    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `/studentMessages/conversationList/completed?userId=${user.id}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setConversationList(data); // save the students in state
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [user.id]); // re-run if userId changes

  const sendMessage = () => {
    if (!text.trim()) return;
    const messageData = {
      author: "You",
      content: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("send_message", messageData);
    setText("");
  };

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        height: 650,
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* Left Sidebar */}
      <Box
        sx={{
          width: "30%",
          p: 2,
          borderRight: "1px solid #e0e0e0",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ fontWeight: 700, mb: 2 }}>Conversations</Typography>

        <TextField
          size="small"
          placeholder="Search..."
          variant="outlined"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Contact List */}
        {["John Doe", "Alexander Sprite", "Juan Dela Cruz"].map((name, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#f0f0f0" },
              ...(i === 0 && { backgroundColor: "#e8f0fe" }), // Active chat
            }}
          >
            <Avatar />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                {name}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Sure, let's connect next week...
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              10:30 AM
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Right Chat Section */}
      <Box
        sx={{
          width: "70%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            borderBottom: "1px solid #e0e0e0",
            height: 70,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#fefefe",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar />
            <Box sx={{ ml: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>John Doe</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Counselor
              </Typography>
            </Box>
          </Box>
          <IconButton>
            <InfoOutlinedIcon />
          </IconButton>
        </Box>

        {/* Message History */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: 3,
            py: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "#f9fafb",
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  msg.author === "You" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              {msg.author !== "You" && <Avatar />}
              <Box
                sx={{
                  textAlign: msg.author === "You" ? "right" : "left",
                }}
              >
                <Box
                  sx={{
                    backgroundColor:
                      msg.author === "You" ? "#1976d2" : "#ffffff",
                    color: msg.author === "You" ? "white" : "black",
                    px: 2,
                    py: 1,
                    borderRadius: 3,
                    boxShadow: 1,
                    maxWidth: "70%",
                    ml: msg.author === "You" ? "auto" : 0,
                  }}
                >
                  <Typography>{msg.content}</Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    ml: msg.author === "You" ? 0 : 1,
                    mr: msg.author === "You" ? 1 : 0,
                  }}
                >
                  {msg.time}
                </Typography>
              </Box>
              {msg.author === "You" && <Avatar />}
            </Box>
          ))}
        </Box>

        {/* Input Area */}
        <Divider />
        <Box
          sx={{
            height: 70,
            px: 2,
            display: "flex",
            alignItems: "center",
            backgroundColor: "white",
          }}
        >
          <TextField
            placeholder="Type a message..."
            fullWidth
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button variant="contained" sx={{ px: 3 }} onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Message;
