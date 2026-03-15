import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import "../styles/header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? "active" : "";
  const dashboardPath = user?.role === "admin" ? "/admin" : "/dashboard";

  const navLinks = [
    { to: "/",          label: "Home" },
    ...(user ? [{ to: dashboardPath, label: "Dashboard" }] : []),
    { to: "/products",  label: "Products" },
    { to: "/lens-guide",label: "Lens Guide" },
    { to: "/book-test", label: "Book Test" },
  ];

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo"><span>eye</span>Studio</Link>

          <nav className="nav">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={isActive(to)}>{label}</Link>
            ))}
          </nav>

          <div className="header-right">
            {user ? (
              <ProfileMenu />
            ) : (
              <Link to="/login">
                <button className="login-btn">Login</button>
              </Link>
            )}
            <button className="hamburger" onClick={() => setMobileOpen((o) => !o)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className={`mobile-nav${mobileOpen ? " open" : ""}`}>
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} onClick={() => setMobileOpen(false)}>{label}</Link>
        ))}
        {user ? (
          <button
            style={{ padding: "10px 14px", background: "none", border: "none", textAlign: "left", color: "var(--danger)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
            onClick={() => { logout(); navigate("/login"); setMobileOpen(false); }}
          >
            Logout
          </button>
        ) : (
          <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
        )}
      </div>
    </>
  );
};

export default Header;
