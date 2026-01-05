import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/prescription.css";
import { API_BASE_URL } from "../../config/api";

const Prescription = () => {
  const { customerId } = useParams(); // ✅ INSIDE component

  const [formData, setFormData] = useState({
    rightEye: { sph: "", cyl: "", axis: "", dv: "", nv: "", add: "" },
    leftEye: { sph: "", cyl: "", axis: "", dv: "", nv: "", add: "" },
    pd: { pd_rl: "", pd_r: "", pd_l: "" },
  });

  const handleChange = (eye, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [eye]: { ...prev[eye], [field]: value },
    }));
  };

  const handlePDChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      pd: { ...prev.pd, [field]: value },
    }));
  };

  const handleSubmit = async () => {
    const res = await fetch(
      `${API_BASE_URL}/prescriptions/${customerId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    if (res.ok) {
      alert("Prescription saved for customer");
    } else {
      alert("Failed to save prescription");
    }
  };

  return (
    <>
      <Header />

      <div className="prescription-container">
        <h2>Eye Checkup – Prescription</h2>

        <div className="prescription-card">
          <h3>Lens Prescription</h3>

          <table className="prescription-table">
            <thead>
              <tr>
                <th>Eye</th>
                <th>SPH</th>
                <th>CYL</th>
                <th>AXIS</th>
                <th>D.V</th>
                <th>N.V</th>
                <th>ADD</th>
              </tr>
            </thead>

            <tbody>
              {["rightEye", "leftEye"].map((eye, index) => (
                <tr key={eye}>
                  <td>
                    <strong>{index === 0 ? "Right (OD)" : "Left (OS)"}</strong>
                  </td>
                  {["sph", "cyl", "axis", "dv", "nv", "add"].map((field) => (
                    <td key={field}>
                      <input
                        value={formData[eye][field]}
                        onChange={(e) =>
                          handleChange(eye, field, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="prescription-card">
          <h3>Pupillary Distance (PD)</h3>

          <div className="pd-grid">
            <div>
              <label>PD (Right + Left)</label>
              <input
                value={formData.pd.pd_rl}
                onChange={(e) => handlePDChange("pd_rl", e.target.value)}
              />
            </div>

            <div>
              <label>PD Right</label>
              <input
                value={formData.pd.pd_r}
                onChange={(e) => handlePDChange("pd_r", e.target.value)}
              />
            </div>

            <div>
              <label>PD Left</label>
              <input
                value={formData.pd.pd_l}
                onChange={(e) => handlePDChange("pd_l", e.target.value)}
              />
            </div>
          </div>
        </div>

        <button className="save-btn" onClick={handleSubmit}>
          Save Prescription
        </button>
      </div>
    </>
  );
};

export default Prescription;
