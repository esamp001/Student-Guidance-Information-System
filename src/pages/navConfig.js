import React from "react";

// Students
import StudentDashboard from "./student/StudentDashboard";
import MyProfile from "./student/MyProfile";
import History from "./student/History";
import Appointment from "./student/Appointments";

// Icons for Student
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";

// ... import other pages here

export const navConfig = {
  student: [
    {
      label: "Dashboard",
      path: "student", // relative
      icon: <DashboardIcon />,
      component: <StudentDashboard />,
    },
    {
      label: "My Profile",
      path: "profile",
      icon: <AccountCircleIcon />,
      component: <MyProfile />,
    },
    {
      label: "Appointments",
      path: "appointments",
      icon: <EventAvailableIcon />,
      component: <Appointment />,
    },
    {
      label: "History",
      path: "history",
      icon: <HistoryIcon />,
      component: <History />,
    },
    {
      label: "Notifications",
      path: "notifications",
      icon: <NotificationsIcon />,
      component: <div>Notifications page</div>,
    },
  ],
  counselor: [
    // {
    //   label: "Dashboard",
    //   path: "/counselor/dashboard",
    //   icon: <SchoolIcon />,
    //   component: <CounselorDashboard />,
    // },
    // {
    //   label: "Students",
    //   path: "/counselor/students",
    //   icon: <SchoolIcon />,
    //   component: <div>Students list page</div>,
    // },
    // {
    //   label: "Appointments",
    //   path: "/counselor/appointments",
    //   icon: <EventAvailableIcon />,
    //   component: <div>Counselor appointments</div>,
    // },
    // {
    //   label: "Case Records",
    //   path: "/counselor/case-records",
    //   icon: <HistoryEduIcon />,
    //   component: <div>Case records</div>,
    // },
    // {
    //   label: "Reports",
    //   path: "/counselor/reports",
    //   icon: <NotificationsIcon />,
    //   component: <div>Reports page</div>,
    // },
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
