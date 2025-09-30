import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyProfile from "./pages/student/MyProfile";
import Appointments from "./pages/student/Appointments";
import History from "./pages/student/History";
import Notification from "./pages/student/Notification";

// Counselor
import CounselorDashboard from "./pages/councilor/CounselorDashboard";
import AppointmentsCounselor from "./pages/councilor/AppointmentsCounselor";
import CaseRecords from "./pages/councilor/CaseRecords";
import Reports from "./pages/councilor/Reports";
import Students from "./pages/councilor/Students";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import CounselorStaffManagement from "./pages/admin/CounselorStaffManagement";
import GuidanceCaseRecords from "./pages/admin/GuidanceCaseRecords";
import Notifications from "./pages/admin/Notifications";
import AdminReports from "./pages/admin/Reports";
import StudentManagement from "./pages/admin/StudentManagement";
import SystemSettings from "./pages/admin/SystemSettings";

import { useRole } from "./context/RoleContext";

function App() {
  const { role } = useRole();

  // Mock: get role from backend after login
  // useEffect(() => {
  //   // Example: fetch("/api/getUserRole").then(...);
  //   // const storedRole = localStorage.getItem("role"); // or fetch from backend
  //   const storedRole = "counselor";
  //   setRole(storedRole);
  // }, []);

  if (!role) {
    // While role is loading
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />}>
          {role === "student" && (
            <>
              <Route index element={<StudentDashboard />} />
              <Route path="student" element={<StudentDashboard />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="history" element={<History />} />
              <Route path="notifications" element={<Notification />} />
            </>
          )}
          {role === "counselor" && (
            <>
              <Route index element={<CounselorDashboard />} />
              <Route path="counselor" element={<CounselorDashboard />} />
              <Route path="appointments" element={<AppointmentsCounselor />} />
              <Route path="caserecords" element={<CaseRecords />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="students" element={<Students />} />
              <Route path="reports" element={<Reports />} />
            </>
          )}
          {role === "admin" && (
            <>
              <Route index element={<AdminDashboard />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route
                path="student/management"
                element={<StudentManagement />}
              />
              <Route
                path="guidance/case/records"
                element={<GuidanceCaseRecords />}
              />
              <Route path="admin-reports" element={<AdminReports />} />
              <Route
                path="counselor-management"
                element={<CounselorStaffManagement />}
              />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<SystemSettings />} />
            </>
          )}
          {/* Optional: redirect unknown roles */}
          {role !== "student" && role !== "counselor" && (
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
