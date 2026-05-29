import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, Package, CalendarCheck,
  UserCircle, LogOut, Menu, ShoppingCart, Shield,
} from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import "../styles/newDashboard.css";
import "../styles/manageOrders.css";

const NavItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <li
    className={`nav-item${active ? " nav-item-active" : ""}`}
    onClick={onClick}
    title={collapsed ? label : ""}
  >
    <Icon size={18} />
    {!collapsed && <span>{label}</span>}
  </li>
);

export default function AdminLayout({ children, active, title, subtitle }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navGo = (path) => { navigate(path); setMobileOpen(false); };

  return (
    <div className="ds-root">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="ds-mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`ds-sidebar${collapsed ? " ds-sidebar-collapsed" : ""}${mobileOpen ? " ds-mobile-open" : ""}`}>
        <div className="ds-sidebar-header">
          {!collapsed && <span className="ds-logo"><span>eye</span>Studio</span>}
          <button className="ds-collapse-btn" onClick={() => setCollapsed(c => !c)}>
            <Menu size={18} />
          </button>
        </div>

        <ul className="ds-nav">
          {!collapsed && <li className="ds-nav-section">Main</li>}
          <NavItem icon={LayoutDashboard} label="Dashboard"         active={active === "dashboard"} onClick={() => navGo("/admin")}                   collapsed={collapsed} />
          <NavItem icon={Users}           label="Customers"         active={active === "customers"} onClick={() => navGo("/admin/manage-customers")}  collapsed={collapsed} />
          <NavItem icon={Package}         label="Products"          active={active === "products"}  onClick={() => navGo("/admin/manage-products")}   collapsed={collapsed} />
          <NavItem icon={ShoppingCart}    label="Orders"            active={active === "orders"}    onClick={() => navGo("/admin/orders")}            collapsed={collapsed} />
          <NavItem icon={CalendarCheck}   label="Eye Test Bookings" active={active === "bookings"}      onClick={() => navGo("/admin/eye-test-bookings")} collapsed={collapsed} />
          <NavItem icon={Shield}           label="Trust Badges"     active={active === "trust-badges"}  onClick={() => navGo("/admin/trust-badges")}      collapsed={collapsed} />
          {!collapsed && <li className="ds-nav-section">Account</li>}
          <NavItem icon={UserCircle}      label="My Profile"        active={active === "profile"}   onClick={() => navGo("/admin/profile")}           collapsed={collapsed} />
        </ul>

        <div className="ds-sidebar-footer">
          <button className="ds-logout-btn" onClick={() => { logout(); navigate("/login"); }} title={collapsed ? "Logout" : ""}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={`ds-main${collapsed ? " ds-main-collapsed" : ""}`}>
        {/* Single shared topbar — no duplicate branding */}
        <header className="ds-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="ds-mobile-menu-btn" onClick={() => setMobileOpen(o => !o)}>
              <Menu size={20} />
            </button>
            {title && (
              <div>
                <p className="ds-page-title">{title}</p>
                {subtitle && <p className="ds-page-sub">{subtitle}</p>}
              </div>
            )}
          </div>
          <ProfileMenu />
        </header>
        {children}
      </div>
    </div>
  );
}
