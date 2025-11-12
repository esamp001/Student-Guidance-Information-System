import React, { useState , useEffect} from "react";
import { 
  Box, 
  Typography, 
  Drawer, 
  useMediaQuery, 
  useTheme 
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { navConfig } from "./navConfig";
import theme from "./../theme";
import { useRole } from "../context/RoleContext";

const SideNavBar = ({ mobileOpen, handleDrawerToggle }) => {
  const muiTheme = useTheme();
  const { user, role } = useRole();
  const navItems = navConfig[role] || [];
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const drawerWidth = 280;

  const NavContent = () => (
    <Box
      sx={{
        width: drawerWidth,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        pt: 2,
      }}
    >
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={`/dashboard/${item.path}`}
          end={item.path === role}
          style={{ textDecoration: "none" }}
          onClick={isMobile ? handleDrawerToggle : undefined}
        >
          {({ isActive }) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mx: 2,
                my: 0.5,
                cursor: "pointer",
                height: 48,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: isActive
                  ? theme.palette.text.secondary
                  : "transparent",
                color: isActive ? "#fff" : theme.palette.text.primary,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: theme.palette.text.secondary,
                  color: "#fff",
                },
              }}
            >
              <Box sx={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                {item.icon}
              </Box>

              <Typography
                sx={{
                  fontWeight: isActive ? 600 : 400,
                  color: "inherit",
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Typography>
            </Box>
          )}
        </NavLink>
      ))}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <NavContent />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          borderRight: "1px solid #e0e0e0",
          position: 'relative',
        },
      }}
      open
    >
      <NavContent />
    </Drawer>
  );
};

export default SideNavBar;
