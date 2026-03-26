import { createContext, useContext, useState } from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  // token kept in state/localStorage for Authorization header fallback
  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  const login = (userData, receivedToken) => {
    setUser(userData);
    setToken(receivedToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", receivedToken);
    // Cookie is set by the server automatically on login response
  };

  const logout = async () => {
    try {
      // Tell server to clear the HTTP-only cookie and destroy session
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",          // send cookie with request
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // Proceed with local logout even if server call fails
    }
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
