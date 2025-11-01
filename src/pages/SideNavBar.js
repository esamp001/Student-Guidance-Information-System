import React, { useState } from "react";
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { navConfig } from "./navConfig";
import theme from "./../theme";
import { useRole } from "../context/RoleContext";
import MenuIcon from "@mui/icons-material/Menu";

const SideNavBar = () => {
  const { role } = useRole();
  const navItems = navConfig[role] || [];
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 240, display: "flex", flexDirection: "column", p: 2 }}>
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={`/dashboard/${item.path}`}
          end={item.path === role}
          style={{ textDecoration: "none" }}
        >
          {({ isActive }) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mt: 1,
                cursor: "pointer",
                height: 40,
                border: "1px solid",
                p: 2,
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
              {item.icon}
              <Typography
                sx={{ fontWeight: isActive ? 600 : 400, color: "inherit" }}
              >
                {item.label}
              </Typography>
            </Box>
          )}
        </NavLink>
      ))}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ m: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }} // Better open performance on mobile
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Box
          sx={{
            borderRight: "1px solid gray",
            width: "20%",
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
            p: 1,
          }}
        >
          {drawerContent}
        </Box>
      )}
    </>
  );
};

export default SideNavBar;
