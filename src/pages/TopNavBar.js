import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Skeleton,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import theme from "./../theme";
import { useRole } from "../context/RoleContext";
import useSnackbar from "../hooks/useSnackbar";
import { useNavigate } from "react-router-dom";

const TopNavBar = () => {
  const navigate = useNavigate();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { user, setUser, setRole } = useRole();
  const [userData, setUserData] = useState(null);
  const [show, setShow] = useState(true); // Track visibility
  const [lastScrollY, setLastScrollY] = useState(0);
  const [avatarAnchor, setavatarAnchor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [loading, setLoading] = useState(true);

  // Handlers
  const handleopenAvatar = (event) => {
    setavatarAnchor(event.currentTarget);
  };

  const handlecloseAvatar = () => {
    setavatarAnchor(null);
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
      setShow(false); // hide on scroll down
    } else {
      setShow(true); // show on scroll up
    }
    setLastScrollY(currentScrollY);
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      const res = await fetch("/loginRoutes/login/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      setUser(null);
      setRole(null);
      navigate("/"); // redirect to login or home

      showSnackbar("Logged out successfully", "success");
    } catch (error) {
      showSnackbar("Logout failed", "error");
    }
  };

  // TOP NAV-BAR LOOOK UP
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(
          `/topNavBarRoutes/data/lookup?userId=${user.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data); // now data is just the student object, not an array
      } catch (error) {
        console.error("Error loading navbar data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user?.id) loadData(); // ensure user is loaded before fetching
  }, [user?.id]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <Box
      sx={{
        borderBottom: "1px solid gray",
        height: 70,
        display: show ? "flex" : "none",
        alignItems: "center",
        justifyContent: "space-between",
        top: 0,
        zIndex: 1000,
        bgcolor: theme.palette.background.default,
        px: 2,
      }}
    >
      {/* Left Logo + Title */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          component="img"
          src="/letranseal.png"
          alt="Letran Seal"
          sx={{ width: 45, height: 45, ml: 1 }}
        />
        <Typography variant="h6" sx={{ ml: 2, fontWeight: "bold" }}>
          Students Information System
        </Typography>
      </Box>

      {/* Right Side (Notifications + User + Logout) */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        {/* Notification Icon with Badge */}
        <IconButton color="inherit" onClick={handleNotificationClick}>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ccc",
                borderRadius: "3px",
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {/* Header */}
          <MenuItem disabled sx={{ backgroundColor: "grey.100" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              Notifications
            </Typography>
          </MenuItem>
          <Divider />

          {/* Notification Items */}
          {[
            "Your profile has been updated",
            "New grade report is available",
            "Reminder: Counseling session tomorrow",
            "You have a new message from your adviser",
            "New announcement: Career Fair this Friday!",
          ].map((text, index) => (
            <MenuItem
              key={index}
              onClick={handleNotificationClose}
              sx={{
                display: "block",
                whiteSpace: "normal", // wrap long text
                borderBottom: "1px solid",
                borderColor: "grey.200",
                py: 1.5,
                px: 2,
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              <Typography variant="body2">{text}</Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
              >
                {`5 mins ago`} {/* Example timestamp */}
              </Typography>
            </MenuItem>
          ))}

          {/* Footer */}
          <Divider />
          <MenuItem
            sx={{
              justifyContent: "center",
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            View all notifications
          </MenuItem>
        </Menu>

        {/* User + Logout */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Loading for session/global */}
          {loading ? (
            <>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="circular" width={40} height={40} />
            </>
          ) : (
            <>
              {/* Loading for userData fetch */}
              {!userData ? (
                <>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="circular" width={40} height={40} />
                </>
              ) : (
                <>
                  <Typography sx={{ fontWeight: 700 }}>
                    {`${userData.first_name || ""} ${
                      userData.last_name || ""
                    }`.trim()}
                  </Typography>

                  <Avatar
                    sx={{ bgcolor: "primary.main", cursor: "pointer" }}
                    onClick={handleopenAvatar}
                  >
                    {userData.first_name?.charAt(0)}
                  </Avatar>
                </>
              )}
            </>
          )}
        </Box>
        <>
          <Menu
            anchorEl={avatarAnchor}
            open={Boolean(avatarAnchor)}
            onClose={handlecloseAvatar}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Typography sx={{ px: 2, py: 1 }}>Account</Typography>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </>
      </Box>
    </Box>
  );
};

export default TopNavBar;
