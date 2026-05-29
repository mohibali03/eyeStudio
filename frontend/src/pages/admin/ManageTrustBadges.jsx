import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import { Shield, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import "../../styles/newDashboard.css";
import "../../styles/managepage.css";
import "../../styles/form.css";

const ICON_OPTIONS = [
  "🛡️","✅","🚚","↩️","💳","⭐","🔒","☀️","💎","🏆",
  "🎯","🔧","📦","🌟","💯","🎁","🔑","🏅","✨","🛒",
];

const EMPTY = { label: "", icon: "🛡️", active: true };

const ManageTrustBadges = () => {
  const [badges, setBadges]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const fetchBadges = () => {
    authFetch(`${API_BASE_URL}/trust-badges/all`)
      .then(r => r.json())
      .then(d => { setBadges(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { showToast("Failed to load badges", "error"); setLoading(false); });
  };

  useEffect(() => { fetchBadges(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) { showToast("Badge label is required", "error"); return; }
    setSaving(true);

    const method = editingId ? "PUT" : "POST";
    const url    = editingId
      ? `${API_BASE_URL}/trust-badges/${editingId}`
      : `${API_BASE_URL}/trust-badges`;

    const res  = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      showToast(editingId ? "Badge updated" : "Badge created");
      setShowForm(false); setEditingId(null); setForm(EMPTY);
      fetchBadges();
    } else {
      showToast(data.message || "Failed to save badge", "error");
    }
  };

  const handleEdit = (b) => {
    setEditingId(b._id);
    setForm({ label: b.label, icon: b.icon, active: b.active });
    setShowForm(true);
    setTimeout(() => document.querySelector(".manage-form-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this badge? Products using it will lose this badge.")) return;
    const res = await authFetch(`${API_BASE_URL}/trust-badges/${id}`, { method: "DELETE" });
    if (res.ok) { fetchBadges(); showToast("Badge deleted"); }
    else showToast("Failed to delete badge", "error");
  };

  const toggleActive = async (b) => {
    const res = await authFetch(`${API_BASE_URL}/trust-badges/${b._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    if (res.ok) fetchBadges();
    else showToast("Failed to update badge", "error");
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm(EMPTY); };

  return (
    <AdminLayout active="trust-badges" title="Trust Badges" subtitle="Manage badges shown on product pages">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="ds-content">

        {/* ── Info bar + Add button ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <p style={{ fontSize:13, color:"var(--text-secondary)" }}>
            Badges created here appear as options when creating or editing a product.
          </p>
          <button
            className="save-btn"
            style={{ display:"flex", alignItems:"center", gap:6 }}
            onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY); }}
          >
            <Plus size={15} /> Add Badge
          </button>
        </div>

        {/* ── Create / Edit form ── */}
        {showForm && (
          <div className="manage-form-card">
            <h3>{editingId ? "Edit Badge" : "Add New Badge"}</h3>
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

              {/* Label */}
              <div className="form-field">
                <label>Badge Label <span style={{ color:"#ef4444" }}>*</span></label>
                <input
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Free Shipping"
                  required
                />
              </div>

              {/* Icon picker */}
              <div className="form-field">
                <label>Icon</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
                  {ICON_OPTIONS.map(ic => (
                    <button
                      key={ic} type="button"
                      onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      style={{
                        width:42, height:42, fontSize:20, borderRadius:8, cursor:"pointer",
                        border: `2px solid ${form.icon === ic ? "var(--primary)" : "var(--border)"}`,
                        background: form.icon === ic ? "var(--primary-light)" : "var(--bg)",
                        transition: "all .15s",
                      }}
                    >{ic}</button>
                  ))}
                </div>
              </div>

              {/* Live preview */}
              <div className="form-field">
                <label>Preview</label>
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:99, fontSize:13, fontWeight:600, color:"#15803d", width:"fit-content" }}>
                  {form.icon} {form.label || "Badge Label"}
                </div>
              </div>

              {/* Active toggle */}
              <div className="form-field">
                <label>Status</label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                  <span>{form.active ? "Active — visible in product form" : "Inactive — hidden from product form"}</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Update Badge" : "Create Badge"}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Badge table ── */}
        <div className="admin-card">
          {loading ? (
            <p style={{ textAlign:"center", padding:32, color:"var(--text-secondary)" }}>Loading…</p>
          ) : badges.length === 0 ? (
            <div style={{ textAlign:"center", padding:48, color:"var(--text-muted)" }}>
              <Shield size={40} style={{ opacity:.25, marginBottom:12 }} />
              <p style={{ fontSize:14 }}>No trust badges yet.</p>
              <p style={{ fontSize:13, marginTop:4 }}>Click "Add Badge" to create your first one.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Label</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {badges.map(b => (
                  <tr key={b._id}>
                    <td style={{ fontSize:22 }}>{b.icon}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontWeight:600 }}>{b.label}</span>
                        <span style={{
                          fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
                          background: b.active ? "#f0fdf4" : "#f8fafc",
                          color:      b.active ? "#15803d" : "#94a3b8",
                          border:     `1px solid ${b.active ? "#bbf7d0" : "#e2e8f0"}`,
                        }}>
                          {b.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(b)}
                        style={{
                          display:"flex", alignItems:"center", gap:5,
                          padding:"5px 12px", borderRadius:6, fontSize:12, fontWeight:600,
                          cursor:"pointer", border:"1.5px solid var(--border)",
                          background: b.active ? "#fef2f2" : "#f0fdf4",
                          color:      b.active ? "#ef4444" : "#15803d",
                          transition:"all .15s",
                        }}
                      >
                        {b.active
                          ? <><X size={12} /> Deactivate</>
                          : <><Check size={12} /> Activate</>
                        }
                      </button>
                    </td>
                    <td style={{ fontSize:12, color:"var(--text-secondary)" }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="edit-btn" onClick={() => handleEdit(b)}>
                          <Pencil size={13} style={{ display:"inline", marginRight:4 }} />Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(b._id)}>
                          <Trash2 size={13} style={{ display:"inline", marginRight:4 }} />Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageTrustBadges;
