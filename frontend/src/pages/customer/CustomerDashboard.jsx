import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import {
  ShoppingBag, Eye, ClipboardList, Package,
} from "lucide-react";
import "../../styles/newDashboard.css";

const statusBadge = (s) => {
  const cls = { pending: "badge-pending", completed: "badge-completed", cancelled: "badge-cancelled" };
  return <span className={`badge ${cls[s] || ""}`}>{s}</span>;
};

export default function CustomerDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  // Fetch orders always (for stat cards too)
  useEffect(() => {
    fetch(`${API_BASE_URL}/orders/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (activeTab === "prescription") {
      fetch(`${API_BASE_URL}/prescriptions/my`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setPrescription).catch(() => {});
    }
  }, [activeTab, token]);

  const lastOrder = orders[0];
  const activePrescription = prescription ? "Available" : "—";

  const tabs = [
    { id: "orders",       label: "My Orders",      icon: ShoppingBag },
    { id: "prescription", label: "My Prescription", icon: Eye },
  ];

  return (
    <div className="cd-root">
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="cd-content">

        {/* ── Welcome Banner ── */}
        <div className="cd-welcome">
          <div className="cd-welcome-text">
            <h2>Welcome back, {user?.name}! 👋</h2>
            <p>Here's a summary of your account activity.</p>
          </div>
          <div className="cd-welcome-icon">
            <Eye size={28} color="#fff" />
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="cd-stats">
          <div className="cd-stat-card">
            <div className="cd-stat-icon" style={{ background: "#eef2ff", color: "#6366f1" }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="cd-stat-label">Total Orders</p>
              <p className="cd-stat-value">{orders.length}</p>
            </div>
          </div>

          <div className="cd-stat-card">
            <div className="cd-stat-icon" style={{ background: "#f0fdf4", color: "#10b981" }}>
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="cd-stat-label">Prescription</p>
              <p className="cd-stat-value" style={{ fontSize: 15 }}>{activePrescription}</p>
            </div>
          </div>

          <div className="cd-stat-card">
            <div className="cd-stat-icon" style={{ background: "#fff7ed", color: "#f59e0b" }}>
              <Package size={20} />
            </div>
            <div>
              <p className="cd-stat-label">Last Order</p>
              <p className="cd-stat-value" style={{ fontSize: 14 }}>
                {lastOrder ? `₹${lastOrder.totalAmount}` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="cd-tabs">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`cd-tab${activeTab === id ? " cd-tab-active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ── Orders Tab ── */}
        {activeTab === "orders" && (
          <div className="cd-panel">
            <div className="cd-panel-header">
              <ShoppingBag size={16} color="#6366f1" />
              <h3>My Orders</h3>
            </div>
            <div className="cd-panel-body">
              <table className="cd-table">
                <thead>
                  <tr><th>Order ID</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {orders.length === 0
                    ? <tr><td colSpan={5} className="cd-empty">No orders found</td></tr>
                    : orders.map(o => (
                      <tr key={o._id}>
                        <td><span className="cd-order-id">#{o._id.slice(-6).toUpperCase()}</span></td>
                        <td>{o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}</td>
                        <td style={{ fontWeight: 700, color: "#6366f1" }}>₹{o.totalAmount}</td>
                        <td>{statusBadge(o.status)}</td>
                        <td style={{ color: "#64748b" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Prescription Tab ── */}
        {activeTab === "prescription" && (
          <div className="cd-panel">
            <div className="cd-panel-header">
              <Eye size={16} color="#6366f1" />
              <h3>My Prescription</h3>
            </div>
            {!prescription
              ? <p className="cd-empty">No prescription available yet.</p>
              : (
                <>
                  <div className="cd-rx-grid">
                    {/* Right Eye */}
                    <div className="cd-rx-eye cd-rx-right">
                      <div className="cd-rx-eye-header">👁 Right Eye (OD)</div>
                      <table className="cd-rx-table">
                        <thead><tr><th>SPH</th><th>CYL</th><th>AXIS</th><th>D.V</th><th>N.V</th><th>ADD</th></tr></thead>
                        <tbody>
                          <tr>{Object.values(prescription.rightEye).map((v, i) => <td key={i}>{v || "—"}</td>)}</tr>
                        </tbody>
                      </table>
                    </div>
                    {/* Left Eye */}
                    <div className="cd-rx-eye cd-rx-left">
                      <div className="cd-rx-eye-header">👁 Left Eye (OS)</div>
                      <table className="cd-rx-table">
                        <thead><tr><th>SPH</th><th>CYL</th><th>AXIS</th><th>D.V</th><th>N.V</th><th>ADD</th></tr></thead>
                        <tbody>
                          <tr>{Object.values(prescription.leftEye).map((v, i) => <td key={i}>{v || "—"}</td>)}</tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="cd-pd-row">
                    <span className="cd-pd-item"><strong>PD (R+L):</strong> {prescription.pd.pd_rl}</span>
                    <span className="cd-pd-item"><strong>PD Right:</strong> {prescription.pd.pd_r}</span>
                    <span className="cd-pd-item"><strong>PD Left:</strong>  {prescription.pd.pd_l}</span>
                  </div>
                </>
              )
            }
          </div>
        )}



      </div>
    </div>
  );
}
