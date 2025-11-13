import React from "react";

// Icons for Student
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";

// Icons for Counselor
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";

// Icons for Admin
import GroupsIcon from "@mui/icons-material/Groups";
import AttributionIcon from "@mui/icons-material/Attribution";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsIcon from "@mui/icons-material/Settings";
import SchoolIcon from "@mui/icons-material/School";

export const navConfig = {
  // ---------------- STUDENT ----------------
  student: [
    { label: "Dashboard", path: "student", icon: <DashboardIcon /> },
    {
      label: "My Profile",
      path: "student/profile",
      icon: <AccountCircleIcon />,
    },
    {
      label: "Appointments",
      path: "student/appointments",
      icon: <EventAvailableIcon />,
    },
    { label: "History", path: "student/history", icon: <HistoryIcon /> },
    {
      label: "Messages",
      path: "student/messages",
      icon: <MarkChatUnreadIcon />,
    },
  ],

  // ---------------- COUNSELOR ----------------
  counselor: [
    { label: "Dashboard", path: "counselor", icon: <DashboardIcon /> },
    { label: "Students", path: "counselor/students", icon: <PeopleIcon /> },
    {
      label: "Appointments",
      path: "counselor/appointments",
      icon: <EventAvailableIcon />,
    },
    {
      label: "Messages",
      path: "counselor/messages",
      icon: <MarkChatUnreadIcon />,
    },
    {
      label: "Case Records",
      path: "counselor/case-records",
      icon: <HistoryEduIcon />,
    },
    {
      label: "Reports",
      path: "counselor/reports",
      icon: <AssessmentIcon />,
    },
  ],

  // ---------------- ADMIN ----------------
  admin: [
    { label: "Dashboard", path: "admin", icon: <SchoolIcon /> },
    {
      label: "Student Management",
      path: "admin/students",
      icon: <GroupsIcon />,
    },
    {
      label: "Counselor Management",
      path: "admin/counselors",
      icon: <ManageAccountsIcon />,
    },
    {
      label: "Guidance Records",
      path: "admin/case-records",
      icon: <AttributionIcon />,
    },
    {
      label: "Reports",
      path: "admin/reports",
      icon: <AssessmentIcon />,
    },
    // {
    //   label: "System Settings",
    //   path: "admin/settings",
    //   icon: <SettingsIcon />,
    // },
  ],
};
