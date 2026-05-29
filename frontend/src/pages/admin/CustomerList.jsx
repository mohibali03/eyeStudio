import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { API_BASE_URL } from "../../config/api";
import "../../styles/admin.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/users?limit=200`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Backend returns paginated shape: { customers: [...], totalCount, ... }
        const list = data.customers ?? (Array.isArray(data) ? data : []);
        setCustomers(list);
      })
      .catch((err) => setError(err.message || "Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <div className="admin-container">
        <h2>Customer List</h2>
        <div className="admin-card">
          {loading && <p style={{ textAlign: "center", padding: 20, color: "#64748b" }}>Loading customers…</p>}
          {!loading && error && <p style={{ textAlign: "center", padding: 20, color: "#ef4444" }}>{error}</p>}
          {!loading && !error && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>No customers found</td></tr>
                ) : customers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td style={{ display: "flex", gap: "10px" }}>
                      <button className="admin-btn" onClick={() => navigate(`/admin/prescription/add/${user._id}`)}>Add Prescription</button>
                      <button className="admin-btn" onClick={() => navigate(`/admin/orders/create/${user._id}`)}>Create Order</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerList;
