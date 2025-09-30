import { createContext, useContext, useState, useEffect } from "react";

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // For now, static role
    const storedRole = "admin"; // student , counselor, admin
    setRole(storedRole);
  }, []);

  console.log(role, "role");

  return (
    <RoleContext.Provider value={{ role, setRole }}>
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
