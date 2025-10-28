import { createContext, useContext, useState, useEffect } from "react";

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/loginRoutes/login/auth/session", {
          credentials: "include", // important for cookies!
        });

        const data = await res.json();

        if (data.loggedIn) {
          setUser(data.user);
          setRole(data.user.role); // dynamic role from session
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return (
    <RoleContext.Provider value={{ user, role, setRole, setUser, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

// Custom hook with safety check
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
