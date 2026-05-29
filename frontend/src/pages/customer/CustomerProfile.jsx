import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import { UserCircle, PenLine } from "lucide-react";
import "../../styles/newDashboard.css";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    authFetch(`${API_BASE_URL}/users/profile`)
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => setToast({ message: "Failed to load profile", type: "error" }));
  }, []);

  return (
    <div className="cd-root">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="cd-content">
        <div className="ds-table-card" style={{ maxWidth: 520 }}>
          <div className="ds-table-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UserCircle size={18} color="var(--primary)" /> My Profile
            </h3>
            <button className="cd-save-btn" onClick={() => navigate("/edit-profile")}>
              <PenLine size={14} style={{ marginRight: 6 }} />Edit Profile
            </button>
          </div>
          {profile ? (
            <div className="cd-profile">
              <div className="cd-profile-info">
                <div className="cd-profile-avatar">{profile.name?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="cd-profile-name">{profile.name}</p>
                  <p className="cd-profile-email">{profile.email}</p>
                  {profile.phone && <p className="cd-profile-email">📞 {profile.phone}</p>}
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="ds-empty">Loading profile…</p>
          )}
        </div>
      </div>
    </div>
  );
}
