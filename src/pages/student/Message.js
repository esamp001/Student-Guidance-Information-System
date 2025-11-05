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
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [latestMessage, setLatestMessage] = useState([]);
  console.log(selectedConversation, "selectedConversation");
  console.log(conversationList, "conversationList");
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
    if (!selectedConversation?.appointment_id) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/messages/lookup?appointmentId=${selectedConversation.appointment_id}`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setMessages(data.messages); // for rendering full chat
        setLatestMessage(data.latestMessage); // optional, if you want to track the last message
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    if (!user.id) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch(
          `/studentMessages/conversationList/completed?userId=${user.id}`
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

  const sendMessage = () => {
    if (!text.trim() || !selectedConversation) return;

    const messageData = {
      receiverId: selectedConversation.counselor_id,
      content: text,
      author: user.id, // use actual user id
      appointmentId: selectedConversation.appointment_id,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send_message", messageData);
    // append locally so it looks like your own message immediately
    setMessages((prev) => [...prev, messageData]);
    setText("");
  };

  useEffect(() => {
    if (!selectedConversation || !user.id) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/studentMessages/messages/lookup?appointmentId=${selectedConversation.appointment_id}&userId=${user.id}`
        );
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
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
        {conversationList?.map((conv, i) => (
          <Box
            key={i}
            onClick={() => setSelectedConversation(conv)} // <-- set selected conversation
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
                {`${conv.counselor_first_name} ${conv.counselor_last_name}`}
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

export default Message;
