import React from "react";

// Icons for Student
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";

// Icons for Councilor
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";

// Icon for Admin
import GroupsIcon from "@mui/icons-material/Groups";
import AttributionIcon from "@mui/icons-material/Attribution";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";
import SettingsIcon from "@mui/icons-material/Settings";
import SchoolIcon from "@mui/icons-material/School";

export const navConfig = {
  student: [
    { label: "Dashboard", path: "student", icon: <DashboardIcon /> },
    { label: "My Profile", path: "profile", icon: <AccountCircleIcon /> },
    {
      label: "Appointments",
      path: "appointments",
      icon: <EventAvailableIcon />,
    },
    { label: "History", path: "history", icon: <HistoryIcon /> },
    {
      label: "Notifications",
      path: "notifications",
      icon: <NotificationsIcon />,
    },
  ],
  counselor: [
    {
      label: "Dashboard",
      path: "counselor",
      icon: <DashboardIcon />,
    },
    { label: "Students", path: "students", icon: <PeopleIcon /> },
    {
      label: "Appointments",
      path: "appointments",
      icon: <EventAvailableIcon />,
    },
    {
      label: "Case Records",
      path: "caserecords",
      icon: <HistoryEduIcon />,
    },
    { label: "Reports", path: "reports", icon: <AssessmentIcon /> },
  ],
  admin: [
    {
      label: "Dashboard",
      path: "admin",
      icon: <SchoolIcon />,
    },
    {
      label: "Student Management",
      path: "student/management",
      icon: <GroupsIcon />,
    },
    {
      label: "Guidance Records",
      path: "guidance/case/records",
      icon: <AttributionIcon />,
    },
    {
      label: "Reports",
      path: "admin-reports",
      icon: <AssessmentIcon />,
    },
    {
      label: "Management",
      path: "counselor-management",
      icon: <ManageAccountsIcon />,
    },
    {
      label: "Notifications & Alerts",
      path: "notifications",
      icon: <CircleNotificationsIcon />,
    },
    {
      label: "System Settings",
      path: "settings",
      icon: <SettingsIcon />,
    },
  ],
};
