import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import MyProfile from "./pages/student/MyProfile";
import Appointments from "./pages/student/Appointments";
import History from "./pages/student/History";
import Message from "./pages/student/Message";

// Counselor
import CounselorDashboard from "./pages/councilor/CounselorDashboard";
import AppointmentsCounselor from "./pages/councilor/AppointmentsCounselor";
import CaseRecords from "./pages/councilor/CaseRecords";
import ReportsCounselor from "./pages/councilor/ReportsCounselor";
import Students from "./pages/councilor/Students";
import CounselorMessage from "./pages/councilor/CounselorMessage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import CounselorStaffManagement from "./pages/admin/CounselorStaffManagement";
import GuidanceCaseRecords from "./pages/admin/GuidanceCaseRecords";
import AdminReports from "./pages/admin/AdminReports";
import StudentManagement from "./pages/admin/StudentManagement";
import SystemSettings from "./pages/admin/SystemSettings";

import { useRole } from "./context/RoleContext";

function App() {
  const { role } = useRole();

  if (!role) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public login route */}
        <Route path="/" element={<Login />} />

        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* ----------- STUDENT ----------- */}
          {role === "student" && (
            <>
              <Route index element={<Navigate to="student" />} />
              <Route path="student" element={<StudentDashboard />} />
              <Route path="student/profile" element={<MyProfile />} />
              <Route path="student/appointments" element={<Appointments />} />
              <Route path="student/history" element={<History />} />
              <Route path="student/messages" element={<Message />} />
            </>
          )}

          {/* ----------- COUNSELOR ----------- */}
          {role === "counselor" && (
            <>
              <Route index element={<Navigate to="counselor" />} />
              <Route path="counselor" element={<CounselorDashboard />} />
              <Route
                path="counselor/appointments"
                element={<AppointmentsCounselor />}
              />
              <Route path="counselor/messages" element={<CounselorMessage />} />
              <Route path="counselor/case-records" element={<CaseRecords />} />
              <Route path="counselor/students" element={<Students />} />
              <Route path="counselor/reports" element={<ReportsCounselor />} />
            </>
          )}

          {/* ----------- ADMIN ----------- */}
          {role === "admin" && (
            <>
              <Route index element={<Navigate to="admin" />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/students" element={<StudentManagement />} />
              <Route
                path="admin/counselors"
                element={<CounselorStaffManagement />}
              />
              <Route
                path="admin/case-records"
                element={<GuidanceCaseRecords />}
              />
              <Route path="admin/reports" element={<AdminReports />} />
              <Route path="admin/settings" element={<SystemSettings />} />
            </>
          )}

          {/* Redirect any invalid role */}
          {role !== "student" && role !== "counselor" && role !== "admin" && (
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
