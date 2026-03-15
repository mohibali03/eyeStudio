import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { PenLine, Eye, EyeOff } from "lucide-react";
import { PASSWORD_RULES, validatePassword, passwordStrength } from "../../utils/passwordValidator";
import "../../styles/newDashboard.css";
import "../../styles/auth.css";

export default function EditProfile() {
  const { token, login, user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setForm({ name: d.name, email: d.email, phone: d.phone || "", password: "" }))
      .catch(() => setToast({ message: "Failed to load profile", type: "error" }));
  }, [token]);

  const [showPw, setShowPw]     = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const strength = passwordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password) {
      const { valid } = validatePassword(form.password);
      if (!valid) {
        setPwTouched(true);
        setToast({ message: "Password does not meet the requirements.", type: "error" });
        return;
      }
    }
    const body = { name: form.name, email: form.email, phone: form.phone };
    if (form.password) body.password = form.password;

    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      login({ ...user, name: data.name, email: data.email, phone: data.phone }, token);
      setForm((f) => ({ ...f, password: "" }));
      setToast({ message: "Profile updated successfully", type: "success" });
    } else {
      setToast({ message: data.message || "Update failed", type: "error" });
    }
  };

  return (
    <div className="cd-root">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="cd-content">
        <div className="ds-table-card" style={{ maxWidth: 520 }}>
          <div className="ds-table-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PenLine size={18} color="var(--primary)" /> Edit Profile
            </h3>
          </div>
          <div style={{ padding: "24px" }}>
            <form onSubmit={handleSubmit} className="cd-form">
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                />
                {form.phone && !/^[0-9]{10}$/.test(form.phone) && (
                  <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Must be exactly 10 digits</p>
                )}
              </div>
              <div>
                <label>
                  New Password{" "}
                  <span style={{ fontWeight: 400, fontSize: 12, color: "var(--muted)" }}>
                    (leave blank to keep current)
                  </span>
                </label>
                <div className="pw-input-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    placeholder="Enter new password"
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setPwTouched(true); }}
                    className={pwTouched && form.password && validatePassword(form.password).failed.length ? "pw-input-error" : ""}
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwTouched && form.password && (
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
                        <li key={r.id} className={r.test(form.password) ? "pw-rule-pass" : "pw-rule-fail"}>
                          <span className="pw-rule-icon">{r.test(form.password) ? "✓" : "✗"}</span>
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <button type="submit" className="cd-save-btn">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
