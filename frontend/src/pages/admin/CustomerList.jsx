import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { API_BASE_URL } from "../../config/api";
import "../../styles/admin.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`, // 🔐 ADMIN AUTH
      },
    })
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch(() => alert("Failed to load customers"));
  }, []);

  return (
    <>
      <Header />

      <div className="admin-container">
        <h2>Customer List</h2>

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="admin-btn"
                      onClick={() =>
                        navigate(`/admin/prescription/add/${user._id}`)
                      }
                    >
                      Add Prescription
                    </button>

                    <button
                      className="admin-btn"
                      onClick={() =>
                        navigate(`/admin/orders/create/${user._id}`)
                      }
                    >
                      Create Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customers.length === 0 && (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              No customers found
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerList;
