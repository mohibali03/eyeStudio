import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import { UserCircle, Eye, EyeOff } from "lucide-react";
import { PASSWORD_RULES, validatePassword, passwordStrength } from "../../utils/passwordValidator";
import "../../styles/newDashboard.css";
import "../../styles/managepage.css";
import "../../styles/auth.css";

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", password: "" });
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  useEffect(() => {
    authFetch(`${API_BASE_URL}/users/profile`)
      .then(r => r.json())
      .then(d => { setProfile(d); setForm({ name: d.name, password: "" }); });
  }, []);

  const [showPw, setShowPw]       = useState(false);
  const [pwTouched, setPwTouched]  = useState(false);
  const strength = passwordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password) {
      const { valid } = validatePassword(form.password);
      if (!valid) { setPwTouched(true); showToast("Password does not meet the requirements.", "error"); return; }
    }
    const body = { name: form.name };
    if (form.password) body.password = form.password;
    const res = await authFetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) { setProfile(data); setForm({ name: data.name, password: "" }); showToast("Profile updated successfully"); }
    else showToast(data.message || "Update failed", "error");
  };

  return (
    <AdminLayout active="profile" title="My Profile" subtitle="Manage your account details">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="ds-content">
        {profile && (
          <div className="ds-table-card" style={{ maxWidth: 520 }}>
            <div className="ds-table-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="ds-avatar" style={{ width: 44, height: 44, fontSize: 18 }}>
                  {profile.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{profile.name}</p>
                  <p style={{ fontSize: 12, color: "#64748b" }}>{profile.email}</p>
                </div>
              </div>
              <span className="badge badge-completed">Admin</span>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
              <form onSubmit={handleSubmit} className="cd-form">
                <div>
                  <label>Full Name</label>
                  <input type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label>
                    New Password{" "}
                    <span style={{ fontWeight: 400, fontSize: 12, color: "#94a3b8" }}>(leave blank to keep current)</span>
                  </label>
                  <div className="pw-input-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      placeholder="Enter new password"
                      onChange={e => { setForm({ ...form, password: e.target.value }); setPwTouched(true); }}
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
        )}
      </div>
    </AdminLayout>
  );
}
