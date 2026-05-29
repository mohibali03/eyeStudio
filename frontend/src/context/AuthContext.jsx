import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  // Tracks whether login() was called before /auth/me resolved,
  // so a stale null response doesn't overwrite the freshly-set user.
  const loginCalledRef = useRef(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        // Only set user from /auth/me if login() hasn't already set it
        if (!loginCalledRef.current) {
          setUser(data?.user || null);
        }
      })
      .catch(() => {
        if (!loginCalledRef.current) setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData) => {
    loginCalledRef.current = true;
    setUser(userData);
    setLoading(false); // immediately unblock routes after login
  }, []);

  const logout = useCallback(async () => {
    loginCalledRef.current = false;
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // proceed even if network fails
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
