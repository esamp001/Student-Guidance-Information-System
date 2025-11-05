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

const CounselorMessage = () => {
  const { user } = useRole();
  console.log(user, "users");
  const [messages, setMessages] = useState([]);
  const [conversationList, setConversationList] = useState([]);
  console.log(conversationList, "conversationalList");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [text, setText] = useState("");

  // Register socket event
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  // Register counselor as active user
  useEffect(() => {
    if (user.id) {
      socket.emit("register_user", user.id);
    }
  }, [user.id]);

  // Fetch list of conversations for counselor
  useEffect(() => {
    if (!user.id) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch(
          `/counselorMessages/conversationList/completed?userId=${user.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch conversation list");
        const data = await res.json();
        setConversationList(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchConversations();
  }, [user.id]);

  // Send message
  const sendMessage = () => {
    if (!text.trim() || !selectedConversation) return;

    const messageData = {
      receiverId: selectedConversation.student_id, // send to student
      content: text,
      author: user.id,
      appointmentId: selectedConversation.appointment_id,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send_message", messageData);
    // Append locally
    setMessages((prev) => [...prev, messageData]);
    setText("");
  };

  // Fetch messages when selecting a conversation
  useEffect(() => {
    if (!selectedConversation || !user.id) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/counselorMessages/messages/lookup?appointmentId=${selectedConversation.appointment_id}&userId=${user.id}`
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [selectedConversation, user.id]);

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
      {/* LEFT: Conversation list */}
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

        {/* Conversation list */}
        {conversationList?.map((conv, i) => (
          <Box
            key={i}
            onClick={() => setSelectedConversation(conv)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#f0f0f0" },
              backgroundColor:
                selectedConversation?.appointment_id === conv.appointment_id
                  ? "#e8f0fe"
                  : "transparent",
            }}
          >
            <Avatar />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                {`${conv.first_name} ${conv.last_name}`}
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
                {conv.latestMessage || "No messages yet"}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {conv.time || "—"}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* RIGHT: Chat window */}
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
              <Typography sx={{ fontWeight: 700 }}>
                {selectedConversation
                  ? `${selectedConversation.first_name} ${selectedConversation.last_name}`
                  : "Select a conversation"}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Student
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
                  String(msg.author) === String(user.id)
                    ? "flex-end"
                    : "flex-start",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              {String(msg.author) !== String(user.id) && <Avatar />}
              <Box
                sx={{
                  textAlign:
                    String(msg.author) === String(user.id) ? "right" : "left",
                }}
              >
                <Box
                  sx={{
                    backgroundColor:
                      String(msg.author) === String(user.id)
                        ? "#1976d2"
                        : "#ffffff",
                    color:
                      String(msg.author) === String(user.id)
                        ? "white"
                        : "black",
                    px: 2,
                    py: 1,
                    borderRadius: 3,
                    boxShadow: 1,
                    maxWidth: "70%",
                    ml: String(msg.author) === String(user.id) ? "auto" : 0,
                  }}
                >
                  <Typography>{msg.content}</Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    ml: String(msg.author) === String(user.id) ? 0 : 1,
                    mr: String(msg.author) === String(user.id) ? 1 : 0,
                  }}
                >
                  {msg.time}
                </Typography>
              </Box>
              {String(msg.author) === String(user.id) && <Avatar />}
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

export default CounselorMessage;
