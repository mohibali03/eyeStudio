import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center", color: "#64748b" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 14 }}>Loading…</p>
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    </div>
  );

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
