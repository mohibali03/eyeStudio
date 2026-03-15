import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/newDashboard.css";
import "../../styles/admin.css";
import "../../styles/managepage.css";

const FIELDS = ["sph", "cyl", "axis", "dv", "nv", "add"];

const PrescriptionModal = ({ customer, token, onClose }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/prescriptions/customer/${customer._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setPrescriptions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [customer._id, token]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "var(--card-bg, #fff)", borderRadius: 12, padding: 24, width: "100%", maxWidth: 700, maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>📋 Prescriptions — {customer.name}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : prescriptions.length === 0 ? (
          <p style={{ color: "var(--text-secondary, #888)" }}>No prescriptions found for this customer.</p>
        ) : (
          prescriptions.map((rx, i) => (
            <div key={rx._id} style={{ border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 13, color: "var(--text-secondary, #888)" }}>
                #{i + 1} — {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--bg, #f9fafb)" }}>
                      <th style={{ padding: "6px 10px", textAlign: "left" }}>Eye</th>
                      {FIELDS.map(f => <th key={f} style={{ padding: "6px 10px" }}>{f.toUpperCase()}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[["rightEye", "Right (OD)"], ["leftEye", "Left (OS)"]].map(([key, label]) => (
                      <tr key={key}>
                        <td style={{ padding: "6px 10px", fontWeight: 500 }}>{label}</td>
                        {FIELDS.map(f => <td key={f} style={{ padding: "6px 10px", textAlign: "center" }}>{rx[key]?.[f] || "—"}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 10, fontSize: 13, display: "flex", gap: 20 }}>
                <span><b>PD (R+L):</b> {rx.pd?.pd_rl || "—"}</span>
                <span><b>PD Right:</b> {rx.pd?.pd_r || "—"}</span>
                <span><b>PD Left:</b> {rx.pd?.pd_l || "—"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ManageCustomers = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [rxCustomer, setRxCustomer] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchCustomers = () => {
    fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => showToast("Failed to load customers", "error"));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE_URL}/users/${editingId}` : `${API_BASE_URL}/users`;
    const body = editingId ? { name: form.name, email: form.email } : form;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setShowForm(false); setEditingId(null); setForm({ name: "", email: "", password: "" });
      fetchCustomers();
      showToast(editingId ? "Customer updated successfully" : "Customer created successfully");
    } else {
      showToast(data.message || "Failed to save customer", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { fetchCustomers(); showToast("Customer deleted"); }
    else showToast("Failed to delete customer", "error");
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout active="customers" title="Customers" subtitle="Manage your customer accounts">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {rxCustomer && <PrescriptionModal customer={rxCustomer} token={token} onClose={() => setRxCustomer(null)} />}

      <div className="ds-content">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="save-btn" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", email: "", password: "" }); }}>
            + Add Customer
          </button>
        </div>

        {showForm && (
          <div className="manage-form-card">
            <h3>{editingId ? "Edit Customer" : "Add New Customer"}</h3>
            <form onSubmit={handleSubmit} className="manage-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Enter name" required />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email" required />
                </div>
                {!editingId && (
                  <div className="form-field">
                    <label>Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 8 chars, upper, lower, number, special" required />
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">{editingId ? "Update" : "Create"}</button>
                <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="manage-search">
          <input type="text" placeholder="🔍 Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, index) => (
                <tr key={customer._id}>
                  <td>{index + 1}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => { setEditingId(customer._id); setForm({ name: customer.name, email: customer.email, password: "" }); setShowForm(true); }}>✏️ Edit</button>
                      <button className="admin-btn" onClick={() => setRxCustomer(customer)}>👁️ Prescriptions</button>
                      <button className="admin-btn" onClick={() => navigate(`/admin/prescription/add/${customer._id}`)}>📋 Add Rx</button>
                      <button className="admin-btn" onClick={() => navigate(`/admin/orders/create/${customer._id}`)}>🛒 Order</button>
                      <button className="delete-btn" onClick={() => handleDelete(customer._id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="no-data">No customers found</p>}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageCustomers;
