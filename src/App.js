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
import CounselorDashboard from "./pages/councilor/CounselorDashboard";

import { useRole } from "./context/RoleContext";

function App() {
  // const [role, setRole] = useState(null);
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
