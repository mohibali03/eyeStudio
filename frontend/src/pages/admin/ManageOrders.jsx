import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, Search, X, Eye, IndianRupee,
  Clock, CheckCircle, XCircle, Loader, Filter,
  User, Package, FileText, Calendar,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import "../../styles/newDashboard.css";
import "../../styles/manageOrders.css";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    icon: Clock,        cls: "badge-pending" },
  processing: { label: "Processing", icon: Loader,       cls: "badge-processing" },
  completed:  { label: "Completed",  icon: CheckCircle,  cls: "badge-completed" },
  cancelled:  { label: "Cancelled",  icon: XCircle,      cls: "badge-cancelled" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.cls} badge-icon`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

export default function ManageOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    authFetch(`${API_BASE_URL}/orders/all`)
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await authFetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      if (selected?._id === orderId) setSelected(prev => ({ ...prev, status }));
      setToast({ type: "success", message: `Order marked as ${status}` });
    } catch {
      setToast({ type: "error", message: "Failed to update status" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const name = o.customer?.name?.toLowerCase() || "";
      const matchSearch = !search || name.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchDate = !dateFilter || new Date(o.createdAt).toLocaleDateString("en-CA") === dateFilter;
      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, search, statusFilter, dateFilter]);

  const stats = useMemo(() => ({
    total:      orders.length,
    pending:    orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed:  orders.filter(o => o.status === "completed").length,
    revenue:    orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
  }), [orders]);

  return (
    <AdminLayout active="orders" title="Orders" subtitle="Manage and track all customer orders">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="ds-content">

        {/* ── Stat Cards ── */}
        <div className="mo-stats">
          <div className="mo-stat-card" style={{ "--accent": "#6366f1" }}>
            <div className="mo-stat-icon" style={{ background: "#eef2ff", color: "#6366f1" }}><ShoppingCart size={20} /></div>
            <div><p className="stat-label">Total Orders</p><p className="stat-value">{stats.total}</p></div>
          </div>
          <div className="mo-stat-card" style={{ "--accent": "#f59e0b" }}>
            <div className="mo-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}><Clock size={20} /></div>
            <div><p className="stat-label">Pending</p><p className="stat-value">{stats.pending}</p></div>
          </div>
          <div className="mo-stat-card" style={{ "--accent": "#0ea5e9" }}>
            <div className="mo-stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><Loader size={20} /></div>
            <div><p className="stat-label">Processing</p><p className="stat-value">{stats.processing}</p></div>
          </div>
          <div className="mo-stat-card" style={{ "--accent": "#10b981" }}>
            <div className="mo-stat-icon" style={{ background: "#d1fae5", color: "#059669" }}><CheckCircle size={20} /></div>
            <div><p className="stat-label">Completed</p><p className="stat-value">{stats.completed}</p></div>
          </div>
          <div className="mo-stat-card" style={{ "--accent": "#10b981" }}>
            <div className="mo-stat-icon" style={{ background: "#d1fae5", color: "#059669" }}><IndianRupee size={20} /></div>
            <div><p className="stat-label">Total Revenue</p><p className="stat-value">₹{stats.revenue.toLocaleString()}</p></div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="mo-filters-bar">
          <div className="mo-search-wrap">
            <Search size={15} className="mo-search-icon" />
            <input
              className="mo-search"
              placeholder="Search by customer name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="mo-clear" onClick={() => setSearch("")}><X size={13} /></button>}
          </div>

          <div className="mo-filter-group">
            <Filter size={14} />
            <select className="mo-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mo-filter-group">
            <Calendar size={14} />
            <input
              type="date"
              className="mo-select"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            {dateFilter && <button className="mo-clear" onClick={() => setDateFilter("")}><X size={13} /></button>}
          </div>

          <span className="mo-count">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* ── Table ── */}
        <div className="ds-table-card">
          <div className="ds-table-header">
            <h3>All Orders</h3>
            <button className="btn-primary-sm" onClick={() => navigate("/admin/manage-customers")}>
              + New Order
            </button>
          </div>

          {loading ? (
            <div className="mo-loading"><Loader size={24} className="mo-spin" /> Loading orders…</div>
          ) : filtered.length === 0 ? (
            <div className="ds-empty" style={{ padding: "48px" }}>No orders found</div>
          ) : (
            <div className="mo-table-wrap">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <tr key={order._id}>
                      <td><span className="mo-order-id">#{order._id.slice(-6).toUpperCase()}</span></td>
                      <td>
                        <div className="ds-customer-row">
                          <div className="ds-mini-avatar">{order.customer?.name?.[0]?.toUpperCase() || "?"}</div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13 }}>{order.customer?.name || "—"}</p>
                            <p style={{ fontSize: 11, color: "var(--muted)" }}>{order.customer?.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--muted)" }}>
                        {order.items?.length > 0
                          ? order.items.map(i => i.productName).join(", ").slice(0, 30) + (order.items.map(i => i.productName).join(", ").length > 30 ? "…" : "")
                          : "—"}
                      </td>
                      <td className="ds-amount">₹{order.totalAmount?.toLocaleString()}</td>
                      <td>
                        <select
                          className={`mo-status-select mo-status-${order.status}`}
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={e => updateStatus(order._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="ds-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="mo-view-btn" onClick={() => setSelected(order)}>
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      {selected && (
        <div className="mo-modal-overlay" onClick={() => setSelected(null)}>
          <div className="mo-modal" onClick={e => e.stopPropagation()}>
            <div className="mo-modal-header">
              <div>
                <h2>Order Details</h2>
                <p className="mo-modal-id">#{selected._id.slice(-6).toUpperCase()}</p>
              </div>
              <button className="mo-modal-close" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>

            <div className="mo-modal-body">

              {/* Customer Info */}
              <div className="mo-modal-section">
                <p className="mo-modal-section-title"><User size={14} /> Customer Information</p>
                <div className="mo-modal-info-grid">
                  <div><span className="mo-info-label">Name</span><span className="mo-info-value">{selected.customer?.name || "—"}</span></div>
                  <div><span className="mo-info-label">Email</span><span className="mo-info-value">{selected.customer?.email || "—"}</span></div>
                </div>
              </div>

              {/* Items */}
              <div className="mo-modal-section">
                <p className="mo-modal-section-title"><Package size={14} /> Order Items</p>
                {selected.items?.length > 0 ? (
                  <table className="mo-items-table">
                    <thead><tr><th>Product</th><th>Frame</th><th>Lens</th><th>Qty</th><th>Price</th></tr></thead>
                    <tbody>
                      {selected.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.productName || "—"}</td>
                          <td>{item.frameType || "—"}</td>
                          <td>{item.lensType || "—"}</td>
                          <td>{item.quantity}</td>
                          <td className="ds-amount">₹{item.price?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="mo-no-data">No items</p>}
              </div>

              {/* Prescription */}
              {selected.prescription && (
                <div className="mo-modal-section">
                  <p className="mo-modal-section-title"><FileText size={14} /> Prescription</p>
                  <div className="mo-modal-info-grid">
                    {["rightSph","rightCyl","rightAxis","leftSph","leftCyl","leftAxis"].map(k => (
                      <div key={k}>
                        <span className="mo-info-label">{k.replace(/([A-Z])/g," $1").trim()}</span>
                        <span className="mo-info-value">{selected.prescription[k] ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Status */}
              <div className="mo-modal-section">
                <p className="mo-modal-section-title"><IndianRupee size={14} /> Price Breakdown</p>
                <div className="mo-price-row">
                  <span>Subtotal</span><span>₹{selected.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="mo-price-row mo-price-total">
                  <span>Total</span><span>₹{selected.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Update */}
              <div className="mo-modal-section">
                <p className="mo-modal-section-title">Update Status</p>
                <div className="mo-modal-status-row">
                  {["pending","processing","completed","cancelled"].map(s => (
                    <button
                      key={s}
                      className={`mo-status-btn mo-status-btn-${s}${selected.status === s ? " mo-status-btn-active" : ""}`}
                      onClick={() => updateStatus(selected._id, s)}
                      disabled={updatingId === selected._id}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
