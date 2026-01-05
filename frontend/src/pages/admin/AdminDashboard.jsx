import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/adminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {/* <h2 className="admin-logo">eyeStudio</h2> */}

          <ul>
            <li onClick={() => navigate("/admin")}>Dashboard</li>
            <li onClick={() => navigate("/admin/customers")}>Customers</li>
            <li onClick={() => navigate("/admin/prescriptions")}>
              Prescriptions
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <h1>Admin Dashboard</h1>

          <div className="admin-cards">
            <div className="admin-card">
              <h3>Customers</h3>
              <p>Manage registered customers</p>
              <button onClick={() => navigate("/admin/customers")}>
                View Customers
              </button>
            </div>

            <div className="admin-card">
              <h3>Add Prescription</h3>
              <p>Create eye checkup prescription</p>
              <button onClick={() => navigate("/admin/customers")}>
                Add Prescription
              </button>
            </div>

            <div className="admin-card">
              <h3>Prescriptions</h3>
              <p>View saved prescriptions</p>
              <button onClick={() => navigate("/admin/prescriptions")}>
                View Prescriptions
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
