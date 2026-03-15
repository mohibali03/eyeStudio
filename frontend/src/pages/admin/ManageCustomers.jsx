import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/newDashboard.css";
import "../../styles/admin.css";
import "../../styles/managepage.css";

const ManageCustomers = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchCustomers = () => {
    fetch(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch(() => showToast("Failed to load customers", "error"));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_BASE_URL}/users/${editingId}`
      : `${API_BASE_URL}/users`;

    const body = editingId
      ? { name: form.name, email: form.email }
      : form;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", email: "", password: "" });
      fetchCustomers();
      showToast(editingId ? "Customer updated successfully" : "Customer created successfully");
    } else {
      showToast("Failed to save customer", "error");
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setForm({ name: customer.name, email: customer.email, password: "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { fetchCustomers(); showToast("Customer deleted"); }
    else showToast("Failed to delete customer", "error");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", email: "", password: "" });
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout active="customers" title="Customers" subtitle="Manage your customer accounts">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="ds-content">

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="save-btn"
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", email: "", password: "" }); }}
            >
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
                      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter password" required />
                    </div>
                  )}
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">{editingId ? "Update" : "Create"}</button>
                  <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="manage-search">
            <input
              type="text"
              placeholder="🔍 Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Actions</th>
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
                        <button className="edit-btn" onClick={() => handleEdit(customer)}>✏️ Edit</button>
                        <button className="admin-btn" onClick={() => navigate(`/admin/prescription/add/${customer._id}`)}>📋 Prescription</button>
                        <button className="admin-btn" onClick={() => navigate(`/admin/orders/create/${customer._id}`)}>🛒 Order</button>
                        <button className="delete-btn" onClick={() => handleDelete(customer._id)}>🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="no-data">No customers found</p>
            )}
          </div>
        </div>
      </AdminLayout>
    );
};

export default ManageCustomers;
