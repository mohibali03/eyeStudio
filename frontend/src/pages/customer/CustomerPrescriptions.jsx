import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import { Eye } from "lucide-react";
import "../../styles/newDashboard.css";

const FIELDS = ["sph", "cyl", "axis", "dv", "nv", "add"];

export default function CustomerPrescriptions() {
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API_BASE_URL}/prescriptions/my`)
      .then((r) => r.json())
      .then((d) => { setPrescriptions(Array.isArray(d) ? d : d ? [d] : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="cd-root">
      <Header />
      <div className="cd-content">
        <div className="ds-table-card" style={{ maxWidth: 800 }}>
          <div className="ds-table-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Eye size={18} color="var(--primary)" /> My Prescriptions
            </h3>
          </div>

          {loading ? (
            <p className="ds-empty">Loading…</p>
          ) : prescriptions.length === 0 ? (
            <p className="ds-empty">No prescription available yet. Visit the store for an eye test.</p>
          ) : (
            <div style={{ padding: "0 20px 20px" }}>
              {prescriptions.map((rx, i) => (
                <div key={rx._id} style={{ border: "1px solid var(--border, #e5e7eb)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                  <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 13, color: "var(--text-secondary, #888)" }}>
                    Prescription #{prescriptions.length - i} &nbsp;·&nbsp;
                    {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>

                  <div className="cd-rx-grid">
                    {[["rightEye", "👁 Right Eye (OD)"], ["leftEye", "👁 Left Eye (OS)"]].map(([key, label]) => (
                      <div key={key} className={`cd-rx-eye ${key === "rightEye" ? "cd-rx-right" : "cd-rx-left"}`}>
                        <div className="cd-rx-eye-header">{label}</div>
                        <table className="cd-rx-table">
                          <thead>
                            <tr>{FIELDS.map(f => <th key={f}>{f.toUpperCase()}</th>)}</tr>
                          </thead>
                          <tbody>
                            <tr>{FIELDS.map(f => <td key={f}>{rx[key]?.[f] || "—"}</td>)}</tr>
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>

                  <div className="cd-pd-row">
                    <span className="cd-pd-item"><strong>PD (R+L):</strong> {rx.pd?.pd_rl || "—"}</span>
                    <span className="cd-pd-item"><strong>PD Right:</strong> {rx.pd?.pd_r || "—"}</span>
                    <span className="cd-pd-item"><strong>PD Left:</strong> {rx.pd?.pd_l || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
