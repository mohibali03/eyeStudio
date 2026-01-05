import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="logo">
        <span>eye</span>Studio
      </div>

      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/lens-guide">Lens Guide</Link>
        <Link to="/book-test">Book Test</Link>
      </nav>

      {/* Right side auth buttons */}
      <div>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontWeight: 500 }}>
              Hi, {user.name}
            </span>

            <button className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button className="login-btn">Login</button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
