import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { CalendarCheck } from "lucide-react";
import "../../styles/newDashboard.css";
import "../../styles/admin.css";

const EyeTestBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/eye-tests`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/eye-tests/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
        setToast({ message: "Status updated", type: "success" });
      } else {
        setToast({ message: "Failed to update status", type: "error" });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    }
  };

  const statusBadge = (s) => {
    const cls = { pending: "badge-warning", completed: "badge-success", cancelled: "badge-danger" };
    return <span className={`badge ${cls[s] || ""}`}>{s}</span>;
  };

  const subtitle = loading ? "Loading…" : error ? "Error loading bookings" : `${bookings.length} total booking${bookings.length !== 1 ? "s" : ""}`;

  return (
    <AdminLayout active="bookings" title="Eye Test Bookings" subtitle={subtitle}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="ds-content">
        <div className="ds-table-card">
          <div className="ds-table-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarCheck size={16} color="var(--primary)" /> All Bookings
            </h3>
          </div>

          {loading && (
            <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading bookings…</p>
          )}

          {!loading && error && (
            <p style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>{error}</p>
          )}

          {!loading && !error && (
            <table className="ds-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={6} className="ds-empty">No Eye Test Bookings Available</td></tr>
                ) : bookings.map((b, i) => (
                  <tr key={b._id}>
                    <td className="ds-muted">{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td className="ds-muted">{b.phone}</td>
                    <td className="ds-muted">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td>{statusBadge(b.status)}</td>
                    <td>
                      <select
                        value={b.status}
                        onChange={e => updateStatus(b._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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

export default EyeTestBookings;
