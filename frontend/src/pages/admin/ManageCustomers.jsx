import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/newDashboard.css";
import "../../styles/admin.css";
import "../../styles/managepage.css";

const FIELDS = ["sph", "cyl", "axis", "dv", "nv", "add"];
const PHONE_RE = /^[0-9]{10}$/;
const PAGE_SIZES = [5, 10, 20];

/* ── Prescription Modal ─────────────────────────────────────────────────── */
const PrescriptionModal = ({ customer, onClose }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/prescriptions/customer/${customer._id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { setPrescriptions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [customer._id]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "var(--card-bg,#fff)", borderRadius: 12, padding: 24, width: "100%", maxWidth: 700, maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>📋 Prescriptions — {customer.name}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {loading ? <p>Loading...</p> : prescriptions.length === 0 ? (
          <p style={{ color: "var(--text-secondary,#888)" }}>No prescriptions found.</p>
        ) : prescriptions.map((rx, i) => (
          <div key={rx._id} style={{ border: "1px solid var(--border,#e5e7eb)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 13, color: "var(--text-secondary,#888)" }}>
              #{i + 1} — {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg,#f9fafb)" }}>
                    <th style={{ padding: "6px 10px", textAlign: "left" }}>Eye</th>
                    {FIELDS.map((f) => <th key={f} style={{ padding: "6px 10px" }}>{f.toUpperCase()}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[["rightEye", "Right (OD)"], ["leftEye", "Left (OS)"]].map(([key, label]) => (
                    <tr key={key}>
                      <td style={{ padding: "6px 10px", fontWeight: 500 }}>{label}</td>
                      {FIELDS.map((f) => <td key={f} style={{ padding: "6px 10px", textAlign: "center" }}>{rx[key]?.[f] || "—"}</td>)}
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
        ))}
      </div>
    </div>
  );
};

/* ── Pagination Bar ─────────────────────────────────────────────────────── */
const Pagination = ({ currentPage, totalPages, totalCount, pageSize, onPageChange, onPageSizeChange }) => {
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to   = Math.min(currentPage * pageSize, totalCount);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 16, padding: "12px 0" }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary,#64748b)" }}>
        Showing <b>{from}–{to}</b> of <b>{totalCount}</b> customers
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ fontSize: 13, color: "var(--text-secondary,#64748b)" }}>Rows:</label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border,#e2e8f0)", fontSize: 13, cursor: "pointer" }}
        >
          {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={btnStyle(currentPage === 1)}
        >← Prev</button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "var(--text-secondary,#64748b)" }}>…</span>
            ) : (
              <button key={p} onClick={() => onPageChange(p)} style={btnStyle(false, p === currentPage)}>{p}</button>
            )
          )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          style={btnStyle(currentPage === totalPages || totalPages === 0)}
        >Next →</button>
      </div>
    </div>
  );
};

const btnStyle = (disabled, active = false) => ({
  padding: "5px 12px",
  borderRadius: 6,
  border: `1px solid ${active ? "var(--primary,#2563eb)" : "var(--border,#e2e8f0)"}`,
  background: active ? "var(--primary,#2563eb)" : "var(--surface,#fff)",
  color: active ? "#fff" : disabled ? "var(--text-muted,#cbd5e0)" : "var(--text,#1e293b)",
  fontSize: 13,
  fontWeight: active ? 700 : 400,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
  transition: "all .15s",
});

/* ── Main Component ─────────────────────────────────────────────────────── */
const ManageCustomers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customers, setCustomers]   = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState({ name: "", email: "", phone: "", password: "" });
  const [toast, setToast]           = useState(null);
  const [rxCustomer, setRxCustomer] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchCustomers = useCallback(() => {
    const params = new URLSearchParams({ page: currentPage, limit: pageSize, search });
    fetch(`${API_BASE_URL}/users?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => showToast("Failed to load customers", "error"));
  }, [currentPage, pageSize, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // Debounce search — only fire after user stops typing
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone && !PHONE_RE.test(form.phone)) {
      showToast("Phone number must be exactly 10 digits.", "error"); return;
    }
    const method = editingId ? "PUT" : "POST";
    const url    = editingId ? `${API_BASE_URL}/users/${editingId}` : `${API_BASE_URL}/users`;
    const body   = editingId ? { name: form.name, email: form.email, phone: form.phone } : form;

    const res  = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (res.ok) {
      setShowForm(false); setEditingId(null);
      setForm({ name: "", email: "", phone: "", password: "" });
      fetchCustomers();
      showToast(editingId ? "Customer updated" : "Customer created");
    } else {
      showToast(data.message || "Failed to save customer", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { fetchCustomers(); showToast("Customer deleted"); }
    else showToast("Failed to delete customer", "error");
  };

  return (
    <AdminLayout active="customers" title="Customers" subtitle="Manage your customer accounts">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {rxCustomer && <PrescriptionModal customer={rxCustomer} onClose={() => setRxCustomer(null)} />}

      <div className="ds-content">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="save-btn" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", email: "", phone: "", password: "" }); }}>
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
                <div className="form-field">
                  <label>Phone Number</label>
                  <input
                    name="phone" type="tel" value={form.phone} maxLength={10}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="10-digit number"
                  />
                  {form.phone && !PHONE_RE.test(form.phone) && (
                    <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Must be exactly 10 digits</p>
                  )}
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
          <input
            type="text" placeholder="🔍 Search by name, email or phone..."
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="no-data">No customers found</td></tr>
              ) : customers.map((customer, index) => (
                <tr key={customer._id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || "—"}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => { setEditingId(customer._id); setForm({ name: customer.name, email: customer.email, phone: customer.phone || "", password: "" }); setShowForm(true); }}>✏️ Edit</button>
                      <button className="admin-btn" onClick={() => setRxCustomer(customer)}>👁️ Prescription</button>
                      <button className="admin-btn" onClick={() => navigate(`/admin/prescription/add/${customer._id}`)}>📋 Add Rx</button>
                      <button className="admin-btn" onClick={() => navigate(`/admin/orders/create/${customer._id}`)}>🛒 Order</button>
                      <button className="delete-btn" onClick={() => handleDelete(customer._id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        />
      </div>
    </AdminLayout>
  );
};

export default ManageCustomers;
