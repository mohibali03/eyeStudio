import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { PASSWORD_RULES, validatePassword, passwordStrength } from "../utils/passwordValidator";
import "../styles/auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPw, setShowPw] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const strength = passwordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !phone || !password) { setError("All fields are required"); return; }
    if (!/^[0-9]{10}$/.test(phone)) { setError("Phone number must be exactly 10 digits."); return; }
    const { valid } = validatePassword(password);
    if (!valid) {
      setError("Password does not meet the requirements below.");
      setPwTouched(true);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); return; }
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-brand">
          <span className="auth-brand-logo"><span>eye</span>Studio</span>
          <h2>Join EyeStudio today</h2>
          <p>Create your account and get access to premium eyewear, expert eye care, and personalized services.</p>
          <div className="auth-brand-features">
            {["Free eye test booking", "Track your orders", "View your prescriptions", "Exclusive member offers"].map(f => (
              <div key={f} className="auth-brand-feature">
                <div className="auth-brand-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Fill in the details below to get started</p>
          </div>

          {error && (
            <div className="auth-error" style={{marginBottom:16}}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {success && (
            <div style={{display:"flex",alignItems:"center",gap:8,background:"#d1fae5",border:"1px solid #6ee7b7",color:"#065f46",padding:"10px 14px",borderRadius:6,fontSize:13,fontWeight:500,marginBottom:16}}>
              <CheckCircle size={15} /> Registration successful! Redirecting to login...
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="auth-field">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                maxLength={10}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
              {phone && !/^[0-9]{10}$/.test(phone) && (
                <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Must be exactly 10 digits</p>
              )}
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div className="pw-input-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPwTouched(true); }}
                  className={pwTouched && validatePassword(password).failed.length ? "pw-input-error" : ""}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwTouched && password && (
                <>
                  <div className="pw-strength-bar">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`pw-strength-seg${strength >= i ? ` pw-strength-${strength <= 2 ? "weak" : strength <= 3 ? "fair" : strength <= 4 ? "good" : "strong"}` : ""}`} />
                    ))}
                  </div>
                  <p className="pw-strength-label">
                    {strength <= 2 ? "Weak" : strength === 3 ? "Fair" : strength === 4 ? "Good" : "Strong"}
                  </p>
                  <ul className="pw-rules">
                    {PASSWORD_RULES.map(r => (
                      <li key={r.id} className={r.test(password) ? "pw-rule-pass" : "pw-rule-fail"}>
                        <span className="pw-rule-icon">{r.test(password) ? "✓" : "✗"}</span>
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <button type="submit" className="auth-btn" disabled={loading || success}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
