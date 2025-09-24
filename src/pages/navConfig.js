import React from "react";

// Students
import StudentDashboard from "./student/StudentDashboard";
import MyProfile from "./student/MyProfile";
import History from "./student/History";
import Appointment from "./student/Appointments";

// Councilor
import CounselorDashboard from "./councilor/CounselorDashboard";
import AppointmentsCounselor from "./councilor/AppointmentsCounselor";
import CaseRecords from "./councilor/CaseRecords";
import Reports from "./councilor/Reports";
import Students from "./councilor/Students";

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

// ... import other pages here

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
      path: "/counselor/dashboard",
      icon: <DashboardIcon />,
    },
    { label: "Students", path: "/counselor/students", icon: <PeopleIcon /> },
    {
      label: "Appointments",
      path: "/counselor/appointments",
      icon: <EventAvailableIcon />,
    },
    {
      label: "Case Records",
      path: "/counselor/case-records",
      icon: <HistoryEduIcon />,
    },
    { label: "Reports", path: "/counselor/reports", icon: <AssessmentIcon /> },
  ],
  admin: [
    // {
    //   label: "Dashboard",
    //   path: "/admin/dashboard",
    //   icon: <SchoolIcon />,
    //   component: <AdminDashboard />,
    // },
    // {
    //   label: "User Management",
    //   path: "/admin/users",
    //   icon: <SchoolIcon />,
    //   component: <div>User management page</div>,
    // },
    // {
    //   label: "Reports",
    //   path: "/admin/reports",
    //   icon: <EventAvailableIcon />,
    //   component: <div>Reports page</div>,
    // },
    // {
    //   label: "System Overview",
    //   path: "/admin/system",
    //   icon: <HistoryEduIcon />,
    //   component: <div>System overview</div>,
    // },
  ],
};
