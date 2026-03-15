import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { Eye } from "lucide-react";
import "../../styles/newDashboard.css";

export default function CustomerPrescriptions() {
  const { token } = useAuth();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/prescriptions/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setPrescription(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  return (
    <div className="cd-root">
      <Header />
      <div className="cd-content">
        <div className="ds-table-card" style={{ maxWidth: 760 }}>
          <div className="ds-table-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Eye size={18} color="var(--primary)" /> My Prescription
            </h3>
          </div>

          {loading ? (
            <p className="ds-empty">Loading…</p>
          ) : !prescription ? (
            <p className="ds-empty">No prescription available yet. Visit the store for an eye test.</p>
          ) : (
            <>
              <div className="cd-rx-grid">
                {/* Right Eye */}
                <div className="cd-rx-eye cd-rx-right">
                  <div className="cd-rx-eye-header">👁 Right Eye (OD)</div>
                  <table className="cd-rx-table">
                    <thead>
                      <tr><th>SPH</th><th>CYL</th><th>AXIS</th><th>D.V</th><th>N.V</th><th>ADD</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Object.values(prescription.rightEye).map((v, i) => (
                          <td key={i}>{v || "—"}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Left Eye */}
                <div className="cd-rx-eye cd-rx-left">
                  <div className="cd-rx-eye-header">👁 Left Eye (OS)</div>
                  <table className="cd-rx-table">
                    <thead>
                      <tr><th>SPH</th><th>CYL</th><th>AXIS</th><th>D.V</th><th>N.V</th><th>ADD</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Object.values(prescription.leftEye).map((v, i) => (
                          <td key={i}>{v || "—"}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="cd-pd-row">
                <span className="cd-pd-item"><strong>PD (R+L):</strong> {prescription.pd?.pd_rl}</span>
                <span className="cd-pd-item"><strong>PD Right:</strong> {prescription.pd?.pd_r}</span>
                <span className="cd-pd-item"><strong>PD Left:</strong>  {prescription.pd?.pd_l}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
