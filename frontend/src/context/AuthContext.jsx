import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext();

// ── Token helpers (sessionStorage — clears on tab close) ─────────────────────
export const getStoredToken = () => sessionStorage.getItem("eyestudio_token");
export const setStoredToken = (t) => sessionStorage.setItem("eyestudio_token", t);
export const clearStoredToken = () => sessionStorage.removeItem("eyestudio_token");

// ── Authenticated fetch helper ────────────────────────────────────────────────
// Sends token via Authorization header AND cookie (belt-and-suspenders).
// Auto-clears token on 401 so stale sessions don't silently fail.
export const authFetch = (url, options = {}) => {
  const token = getStoredToken();
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then((res) => {
    if (res.status === 401) clearStoredToken();
    return res;
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const loginCalledRef        = useRef(false);

  // On mount: try to restore session from stored token
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // Verify the stored token is still valid
    fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!loginCalledRef.current) {
          setUser(data?.user || null);
          if (!data?.user) clearStoredToken(); // token expired/invalid
        }
      })
      .catch(() => {
        if (!loginCalledRef.current) {
          setUser(null);
          clearStoredToken();
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, token) => {
    loginCalledRef.current = true;
    setUser(userData);
    if (token) setStoredToken(token);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    loginCalledRef.current = false;
    const token = getStoredToken();
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // proceed even if network fails
    }
    setUser(null);
    clearStoredToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
