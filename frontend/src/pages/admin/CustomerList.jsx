import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { API_BASE_URL } from "../../config/api";
import "../../styles/admin.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/users`)
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  }, []);

  return (
    <>
      <Header />

      <div className="admin-container">
        <h2>Customers</h2>

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      className="admin-btn"
                      onClick={() =>
                        navigate(`/admin/prescription/add/${user._id}`)
                      }
                    >
                      Add Prescription
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
