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
  Badge,
  Drawer,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import socket from "../../hooks/socket";
import { useRole } from "../../context/RoleContext";

const Message = () => {
  const { user } = useRole();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [messages, setMessages] = useState([]);
  const [conversationList, setConversationList] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [text, setText] = useState("");
  const [unreadByConv, setUnreadByConv] = useState({});
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null); // For auto-scroll
  const scrollContainerRef = useRef(null);

  // Socket connect/debug
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

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

  // Fetch unread counts grouped by conversation
  useEffect(() => {
    if (!user.id) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`/studentMessages/unreadByConversation?userId=${user.id}`);
        if (res.ok) {
          const map = await res.json();
          setUnreadByConv(map || {});
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUnread();
  }, [user.id]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation?.appointment_id || !user.id) return;
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/studentMessages/messages/lookup?appointmentId=${selectedConversation.appointment_id}&userId=${user.id}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        console.log("Fetched messages:", data);
        setMessages(data.messages || []);
        setAppointmentInfo(data.appointment || null);
        try {
          await fetch(`/studentMessages/mark-read`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, appointmentId: selectedConversation.appointment_id }),
          });
          setUnreadByConv((prev) => ({ ...prev, [String(selectedConversation.appointment_id)]: 0 }));
        } catch (_) {}
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
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation, user.id]);

  // Real-time receive
  useEffect(() => {
    const handleReceive = (data) => {
      console.log("Received Student:", data);
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
      if (data.appointmentId !== selectedConversation?.appointment_id) {
        setUnreadByConv((prev) => {
          const key = String(data.appointmentId);
          return { ...prev, [key]: (prev[key] || 0) + 1 };
        });
      }
    };
    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [selectedConversation]);

  // Real-time unread updates (server recalculations)
  useEffect(() => {
    const handleUnread = (payload) => {
      const { appointmentId, count } = payload || {};
      if (!appointmentId) return;
      setUnreadByConv((prev) => ({ ...prev, [String(appointmentId)]: Number(count) || 0 }));
      if (appointmentId === selectedConversation?.appointment_id) {
        setUnreadByConv((prev) => ({ ...prev, [String(appointmentId)]: 0 }));
      }
    };
    socket.on("unread_update", handleUnread);
    return () => socket.off("unread_update", handleUnread);
  }, [selectedConversation]);

  // Listen for appointment completion and follow-up events
  useEffect(() => {
    const handleAppointmentCompleted = (payload) => {
      const { appointmentId } = payload || {};
      if (!appointmentId) return;
      
      // Remove conversation from list
      setConversationList(prev => 
        prev.filter(conv => conv.appointment_id !== Number(appointmentId))
      );
      
      // Clear selection if it's the current conversation
      if (selectedConversation?.appointment_id === Number(appointmentId)) {
        setSelectedConversation(null);
        setMessages([]);
        setAppointmentInfo(null);
      }
    };

    const handleAppointmentFollowup = (payload) => {
      const { appointmentId } = payload || {};
      if (!appointmentId) return;
      
      // Remove conversation from list
      setConversationList(prev => 
        prev.filter(conv => conv.appointment_id !== Number(appointmentId))
      );
      
      // Clear selection if it's the current conversation
      if (selectedConversation?.appointment_id === Number(appointmentId)) {
        setSelectedConversation(null);
        setMessages([]);
        setAppointmentInfo(null);
      }
    };

    socket.on("appointment_completed", handleAppointmentCompleted);
    socket.on("appointment_followup", handleAppointmentFollowup);
    
    return () => {
      socket.off("appointment_completed", handleAppointmentCompleted);
      socket.off("appointment_followup", handleAppointmentFollowup);
    };
  }, [selectedConversation]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-scroll only when user is near bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const threshold = 40; // px
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom <= threshold;
    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Send message
  const sendMessage = () => {
    // Prevent sending if chat is not yet available
    const now = new Date();
    const apptDate = appointmentInfo?.datetime
      ? new Date(appointmentInfo.datetime)
      : null;
    const canChat = apptDate ? now >= apptDate : true; // allow if no appt info
    if (!text.trim() || !selectedConversation || !canChat) return;
    const messageData = {
      receiverId: Number(
        selectedConversation.counselor_user_id ||
          selectedConversation.counselor_id
      ),
      content: text,
      author: Number(user.id),
      appointmentId: Number(selectedConversation.appointment_id),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    console.log("Sending:", messageData);
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
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });
  };

  const drawerWidth = 320;

  const sidebarContent = (
    <Box
      sx={{
        width: isMobile ? drawerWidth : "100%",
        p: 2,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Typography sx={{ fontWeight: 700, mb: 2, fontSize: isMobile ? 18 : 16 }}>
        Conversations
      </Typography>
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
          onClick={async () => {
            setSelectedConversation(conv);
            if (isMobile) {
              setMobileDrawerOpen(false);
            }
            try {
              await fetch(`/studentMessages/mark-read`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, appointmentId: conv.appointment_id }),
              });
            } catch (_) {}
            setUnreadByConv((prev) => ({ ...prev, [String(conv.appointment_id)]: 0 }));
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: isMobile ? 1.5 : 1,
            borderRadius: 2,
            cursor: "pointer",
            "&:hover": { backgroundColor: "#f0f0f0" },
            backgroundColor:
              selectedConversation?.appointment_id === conv.appointment_id
                ? "#e8f0fe"
                : "transparent",
          }}
        >
          <Avatar sx={{ width: isMobile ? 45 : 40, height: isMobile ? 45 : 40 }} />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: isMobile ? 15 : 14,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1
                }}
              >
                {`${conv.counselor_first_name} ${conv.counselor_last_name}`}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: isMobile ? 13 : 12,
                color: "text.secondary",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                mt: 0.3,
              }}
            >
              {conv.latestMessage || "No messages yet"}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: "text.secondary",
                fontSize: isMobile ? 11 : 10
              }}
            >
              {conv.time || "—"}
            </Typography>
          </Box>
          {Number(unreadByConv[String(conv.appointment_id)]) > 0 && (
            <Badge
              color="error"
              badgeContent={Number(unreadByConv[String(conv.appointment_id)])}
              sx={{ flexShrink: 0, mr: 3, mb: 1 }}
            />
          )}
        </Box>
      ))}
    </Box>
  );

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        height: isMobile ? "calc(100vh - 120px)" : 620,
        borderRadius: isMobile ? 1 : 3,
        overflow: "hidden",
        backgroundColor: "#f9fafb",
        position: "relative",
      }}
    >
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: "30%",
            borderRight: "1px solid #e0e0e0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {/* Right Chat Section */}
      <Box
        sx={{
          width: isMobile ? "100%" : "70%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            borderBottom: "1px solid #e0e0e0",
            height: isMobile ? 60 : 70,
            px: isMobile ? 2 : 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#fefefe",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            {isMobile && (
              <IconButton
                onClick={() => {
                  if (selectedConversation) {
                    setSelectedConversation(null);
                  } else {
                    setMobileDrawerOpen(true);
                  }
                }}
                sx={{ mr: 1 }}
              >
                {selectedConversation ? <ArrowBackIcon /> : <MenuIcon />}
              </IconButton>
            )}
            {!isMobile && !selectedConversation && (
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Avatar sx={{ width: isMobile ? 35 : 40, height: isMobile ? 35 : 40 }} />
            <Box sx={{ ml: 1, minWidth: 0, flex: 1 }}>
              <Typography 
                sx={{ 
                  fontWeight: 700,
                  fontSize: isMobile ? 14 : 16,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {selectedConversation
                  ? `${selectedConversation.counselor_first_name} ${selectedConversation.counselor_last_name}`
                  : isMobile ? "Messages" : "Select a conversation"}
              </Typography>
              {selectedConversation && (
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? 11 : 12 }}
                >
                  Counselor
                </Typography>
              )}
            </Box>
          </Box>
          {selectedConversation && (
            <IconButton size={isMobile ? "small" : "medium"}>
              <InfoOutlinedIcon />
            </IconButton>
          )}
        </Box>
        {/* Message History */}
        {!appointmentInfo ? (
          // Fallback when no conversation selected
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
              backgroundColor: "#f9fafb",
              borderRadius: 1
            }}
          >
            <Typography variant="body1" sx={{ mb: 1 }}>
              No conversation selected.
            </Typography>
            <Typography variant="body2">
              Select a counselor from the list to start chatting.
            </Typography>
          </Box>
        ) : (
          // Original chat UI
          <Box
            ref={scrollContainerRef}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              px: isMobile ? 2 : 3,
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
                      {`Messages to this counselor aren't available yet. ${days > 0 ? days : 1
                        } day${days === 1 ? "" : "s"} before you can ask for advice.`}
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
                  gap: isMobile ? 0.5 : 1,
                  px: isMobile ? 1 : 0,
                }}
              >
                {String(msg.author) !== String(user.id) && (
                  <Avatar sx={{ width: isMobile ? 30 : 40, height: isMobile ? 30 : 40 }} />
                )}

                <Box
                  sx={{
                    textAlign:
                      String(msg.author) === String(user.id) ? "right" : "left",
                    maxWidth: isMobile ? "85%" : "70%",
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
                      px: isMobile ? 1.5 : 2,
                      py: isMobile ? 0.8 : 1,
                      borderRadius: 3,
                      boxShadow: 1,
                      ml: String(msg.author) === String(user.id) ? "auto" : 0,
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography sx={{ fontSize: isMobile ? 14 : 16 }}>
                      {msg.content}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      ml: String(msg.author) === String(user.id) ? 0 : 1,
                      mr: String(msg.author) === String(user.id) ? 1 : 0,
                      fontSize: isMobile ? 10 : 11,
                    }}
                  >
                    {msg.time}
                  </Typography>
                </Box>

                {String(msg.author) === String(user.id) && (
                  <Avatar sx={{ width: isMobile ? 30 : 40, height: isMobile ? 30 : 40 }} />
                )}
              </Box>
            ))}

            <div ref={messagesEndRef} />
          </Box>
        )}

        {/* Input Area */}
        <Divider />
        {appointmentInfo && (<Box
          sx={{
            height: isMobile ? 80 : 100,
            px: isMobile ? 1.5 : 2,
            py: isMobile ? 1 : 0,
            display: "flex",
            alignItems: "center",
            backgroundColor: "white",
            gap: isMobile ? 0.5 : 1,
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
                  sx={{ 
                    mr: isMobile ? 0.5 : 1,
                    "& .MuiInputBase-input": {
                      fontSize: isMobile ? 14 : 16,
                    }
                  }}
                  value={text}
                  disabled={disabled}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button
                  variant="contained"
                  sx={{ 
                    px: isMobile ? 2 : 3,
                    minWidth: isMobile ? "auto" : "64px",
                    fontSize: isMobile ? 12 : 14
                  }}
                  onClick={sendMessage}
                  disabled={disabled}
                >
                  {isMobile ? "Send" : "Send"}
                </Button>
              </>
            );
          })()}
        </Box>)}
      
      </Box>
    </Paper>
  );
};
export default Message;
