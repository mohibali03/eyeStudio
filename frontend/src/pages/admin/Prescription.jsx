import { useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import { Eye, Save } from "lucide-react";
import "../../styles/prescription.css";

const FIELDS = ["sph", "cyl", "axis", "dv", "nv", "add"];

const Prescription = () => {
  const { customerId } = useParams();
  const [formData, setFormData] = useState({
    rightEye: { sph: "", cyl: "", axis: "", dv: "", nv: "", add: "" },
    leftEye:  { sph: "", cyl: "", axis: "", dv: "", nv: "", add: "" },
    pd: { pd_rl: "", pd_r: "", pd_l: "" },
  });
  const [toast, setToast] = useState(null);

  const handleChange = (eye, field, value) =>
    setFormData(prev => ({ ...prev, [eye]: { ...prev[eye], [field]: value } }));

  const handlePD = (field, value) =>
    setFormData(prev => ({ ...prev, pd: { ...prev.pd, [field]: value } }));

  const handleSubmit = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/prescriptions/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setToast({ message: res.ok ? "Prescription saved successfully" : (data.message || "Failed to save prescription"), type: res.ok ? "success" : "error" });
    } catch {
      setToast({ message: "Network error. Please try again.", type: "error" });
    }
  };

  return (
    <AdminLayout active="customers" title="Add Prescription" subtitle="Enter lens prescription details for the customer">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="ds-content">
        {/* Lens Table */}
        <div className="prescription-card">
          <div className="prescription-card-header">
            <Eye size={16} color="var(--primary)" />
            <h3>Lens Prescription</h3>
          </div>
          <div style={{overflowX:"auto"}}>
            <table className="prescription-table">
              <thead>
                <tr>
                  <th style={{textAlign:"left",paddingLeft:20}}>Eye</th>
                  {FIELDS.map(f => <th key={f}>{f.toUpperCase()}</th>)}
                </tr>
              </thead>
              <tbody>
                {["rightEye", "leftEye"].map((eye, i) => (
                  <tr key={eye}>
                    <td>{i === 0 ? "Right (OD)" : "Left (OS)"}</td>
                    {FIELDS.map(field => (
                      <td key={field}>
                        <input
                          value={formData[eye][field]}
                          onChange={e => handleChange(eye, field, e.target.value)}
                          placeholder="—"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PD */}
        <div className="prescription-card">
          <div className="prescription-card-header">
            <Eye size={16} color="var(--primary)" />
            <h3>Pupillary Distance (PD)</h3>
          </div>
          <div className="pd-grid">
            {[["pd_rl","PD (Right + Left)"],["pd_r","PD Right"],["pd_l","PD Left"]].map(([key, label]) => (
              <div key={key}>
                <label>{label}</label>
                <input value={formData.pd[key]} onChange={e => handlePD(key, e.target.value)} placeholder="e.g. 64" />
              </div>
            ))}
          </div>
        </div>

        <div className="prescription-save-wrap">
          <button className="prescription-save-btn" onClick={handleSubmit}>
            <Save size={15} style={{display:"inline",verticalAlign:"middle",marginRight:6}} />
            Save Prescription
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Prescription;
