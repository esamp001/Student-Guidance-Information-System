import React, { useState, useEffect, useRef } from "react";
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
import useSnackbar from "../../hooks/useSnackbar";
import { sendNotification } from "../../utils/notification";

const CounselorMessage = () => {
  const { user } = useRole();
  const [messages, setMessages] = useState([]);
  const [conversationList, setConversationList] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  console.log("Selected Conversation:", selectedConversation);
  const [loading, setLoading] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  console.log("Appointment Info:", appointmentInfo);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
   const { showSnackbar, SnackbarComponent } = useSnackbar();

  const handleAppointmentCompletion = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/appointmentRequest/appointments/completed/${selectedConversation.appointment_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...selectedConversation, status: "Completed" }),
        }
      );

      if (!response.ok) throw new Error("Failed to make completed appointment");

      showSnackbar("Appointment confirmed successfully!", "success");

      // Notify student about completion
      await sendNotification({
        userId: selectedConversation.student_id,
        type: "message",
        context: { sender: "Counselor" },
      });

    } catch (error) {
      console.error("Error confirming appointment:", error);
      showSnackbar("Failed to confirm appointment.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Register user
  useEffect(() => {
    if (user.id) {
      console.log("Registering user:", user.id, typeof user.id);
      socket.emit("register_user", Number(user.id));
    }
  }, [user.id]);

  // Fetch conversation list
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

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation?.appointment_id || !user.id) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/counselorMessages/messages/lookup?appointmentId=${selectedConversation.appointment_id}&userId=${user.id}`
        );
        const data = await res.json();
        setMessages(data.messages || data || []);
       
        if (selectedConversation) {
          setAppointmentInfo({
              datetime: selectedConversation.appointment_datetime || null,
              datetime_readable: selectedConversation.appointment_datetime_readable || null,
          });
        }

        // Force jump to bottom on initial load of a conversation (ensure DOM painted)
        setTimeout(() => {
          const container = scrollContainerRef.current;
          if (container) {
            container.scrollTop = container.scrollHeight;
          } else {
            messagesEndRef.current?.scrollIntoView({
              behavior: "auto",
              block: "end",
            });
          }
        }, 0);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();
  }, [selectedConversation, user.id]);

  // Real-time receive
  useEffect(() => {
    const handleReceive = (data) => {
      if (data.appointmentId === selectedConversation?.appointment_id) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              String(m.appointmentId || m.appointment_id) ===
                String(data.appointmentId) &&
              String(m.author) === String(data.author) &&
              String(m.content) === String(data.content) &&
              String(m.time) === String(data.time)
          );
          return exists ? prev : [...prev, data];
        });
      }
      setConversationList((prev) =>
        prev.map((conv) =>
          conv.appointment_id === data.appointmentId
            ? { ...conv, latestMessage: data.content, time: data.time }
            : conv
        )
      );
    };
    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [selectedConversation]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    const now = new Date();
    const apptDate = appointmentInfo?.datetime
      ? new Date(appointmentInfo.datetime)
      : null;
    const canChat = apptDate ? now >= apptDate : true;
    if (!text.trim() || !selectedConversation || !canChat) return;
    const messageData = {
      receiverId: Number(
        selectedConversation.student_user_id || selectedConversation.student_id
      ),
      content: text,
      author: Number(user.id),
      appointmentId: Number(selectedConversation.appointment_id),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setConversationList((prev) =>
      prev.map((conv) =>
        conv.appointment_id === selectedConversation.appointment_id
          ? { ...conv, latestMessage: text, time: messageData.time }
          : conv
      )
    );
    setText("");

    // Force scroll to bottom after sending
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
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
        {!appointmentInfo ? (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              color: "text.secondary",
              px: 2,
            }}
          >
            <Typography variant="body1" sx={{ mb: 1 }}>
              No conversation selected.
            </Typography>
            <Typography variant="body2">
              Select a conversation from the list to start chatting.
            </Typography>
          </Box>
        ) : (
          //  Your existing message UI goes here
          <Box
            ref={scrollContainerRef}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              maxHeight: 460,
              px: 3,
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              backgroundColor: "#f9fafb",
            }}
          >
            {(() => {
              const now = new Date();
              const apptDate = appointmentInfo?.datetime
                ? new Date(appointmentInfo.datetime)
                : null;
              const notYet = apptDate ? now < apptDate : false;

              if (notYet) {
                const msDiff = apptDate - now;
                const days = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
                return (
                  <Box
                    sx={{
                      border: "1px dashed #bbb",
                      backgroundColor: "#fff",
                      borderRadius: 2,
                      p: 2,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body2">
                      {`Messages to this student aren't available yet. ${days > 0 ? days : 1
                        } day${days === 1 ? "" : "s"} before the appointment you can start chatting.`}
                    </Typography>
                    {appointmentInfo?.datetime_readable && (
                      <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                        {`Appointment: ${appointmentInfo.datetime_readable}`}
                      </Typography>
                    )}
                  </Box>
                );
              }
              return null;
            })()}

            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    String(msg.author) === String(user.id) ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: 1,
                }}
              >
                {String(msg.author) !== String(user.id) && <Avatar />}

                <Box sx={{ textAlign: String(msg.author) === String(user.id) ? "right" : "left" }}>
                  <Box
                    sx={{
                      backgroundColor:
                        String(msg.author) === String(user.id) ? "#1976d2" : "#ffffff",
                      color: String(msg.author) === String(user.id) ? "white" : "black",
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      boxShadow: 1,
                      maxWidth: "100%",
                      ml: String(msg.author) === String(user.id) ? "auto" : 0,
                    }}
                  >
                    <Typography>{msg.content}</Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {msg.time}
                  </Typography>
                </Box>

                {String(msg.author) === String(user.id) && <Avatar />}
              </Box>
            ))}

            <div ref={messagesEndRef} />
          </Box>
        )}

        {/* Input Area */}
        <Divider />
        {(
          selectedConversation?.appointment_status === "Confirmed" ||
          selectedConversation?.appointment_status === "Confirmed Reschedule"
        ) && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={() => handleAppointmentCompletion(selectedConversation.appointment_id)}>
              Mark this appointment as completed
            </Button>
            </Box>
          )}
       
        {appointmentInfo && (<Box
          sx={{
            height: "80px",
            px: 2,
            display: "flex",
            alignItems: "center",
            backgroundColor: "white",
          }}
        >
          {(() => {
            const now = new Date();
            const apptDate = appointmentInfo?.datetime
              ? new Date(appointmentInfo.datetime)
              : null;
            const notYet = apptDate ? now < apptDate : false;
            const disabled = notYet;
            return (
              <>
                <TextField
                  placeholder="Type a message..."
                  fullWidth
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                  value={text}
                  disabled={disabled}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button
                  variant="contained"
                  sx={{ px: 3 }}
                  onClick={sendMessage}
                  disabled={disabled}
                >
                  Send
                </Button>
              </>
            );
          })()}
        </Box>)}
      </Box>
      {SnackbarComponent}
    </Paper>
  );
};
export default CounselorMessage;
