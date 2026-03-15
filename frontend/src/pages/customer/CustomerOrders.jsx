import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { ShoppingBag } from "lucide-react";
import "../../styles/newDashboard.css";

const statusBadge = (s) => {
  const cls = { pending: "badge-pending", completed: "badge-completed", cancelled: "badge-cancelled" };
  return <span className={`badge ${cls[s] || ""}`}>{s}</span>;
};

export default function CustomerOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [token]);

  return (
    <div className="cd-root">
      <Header />
      <div className="cd-content">
        <div className="ds-table-card">
          <div className="ds-table-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingBag size={18} color="var(--primary)" /> My Orders
            </h3>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
          </div>
          <table className="cd-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="cd-empty">No orders found</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id}>
                    <td><span className="cd-order-id">#{o._id.slice(-6).toUpperCase()}</span></td>
                    <td>{o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}</td>
                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>₹{o.totalAmount}</td>
                    <td>{statusBadge(o.status)}</td>
                    <td style={{ color: "var(--muted)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
