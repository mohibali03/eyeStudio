import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required"); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",   // receive HTTP-only cookie from server
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed"); return; }
      login(data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-brand">
          <span className="auth-brand-logo"><span>eye</span>Studio</span>
          <h2>Welcome back to EyeStudio</h2>
          <p>Your trusted optical store for premium eyewear and professional eye care services.</p>
          <div className="auth-brand-features">
            {["Premium eyewear collection", "Expert eye examinations", "Personalized lens solutions", "Fast & easy appointments"].map(f => (
              <div key={f} className="auth-brand-feature">
                <div className="auth-brand-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-header">
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="auth-error" style={{marginBottom:16}}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
