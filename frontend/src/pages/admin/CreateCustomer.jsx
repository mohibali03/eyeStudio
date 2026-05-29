import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import { UserPlus } from "lucide-react";
import "../../styles/newDashboard.css";
import "../../styles/form.css";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ name: "", email: "", password: "" });
  const [toast, setToast] = useState(null);

  const handleChange = e => setCustomer({ ...customer, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await authFetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });
    const data = await res.json();
    if (res.ok) {
      setToast({ message: "Customer created successfully", type: "success" });
      setTimeout(() => navigate("/admin/manage-customers"), 1500);
    } else {
      setToast({ message: data.message || "Failed to create customer", type: "error" });
    }
  };

  return (
    <AdminLayout active="customers">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <header className="ds-topbar">
        <div>
          <p className="ds-page-title">Create Customer</p>
          <p className="ds-page-sub">Add a new customer account</p>
        </div>
      </header>
      <div className="ds-content">
        <div className="ds-table-card" style={{maxWidth:480}}>
          <div className="ds-table-header">
            <h3 style={{display:"flex",alignItems:"center",gap:8}}><UserPlus size={16} color="var(--primary)" /> Customer Details</h3>
          </div>
          <form onSubmit={handleSubmit} className="form-body">
            <div className="form-field">
              <label>Full Name</label>
              <input name="name" placeholder="John Doe" onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="john@example.com" onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input name="password" type="password" placeholder="Create a password" onChange={handleChange} required />
            </div>
            <button type="submit" className="form-submit-btn">Create Customer</button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateCustomer;
