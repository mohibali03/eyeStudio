import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User, PenLine, ShoppingBag, FileText,
  LayoutDashboard, LogOut, ChevronDown, ShieldCheck,
} from "lucide-react";
import "../styles/profileMenu.css";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);

  const isAdmin = user?.role === "admin";
  const initial = user?.name?.[0]?.toUpperCase() || "?";

  /* Position dropdown relative to trigger using viewport coords */
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top:   rect.bottom + window.scrollY + 8,
      right: window.innerWidth - rect.right,
    });
  }, []);

  const toggle = () => {
    calcPos();
    setOpen((o) => !o);
  };

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        !document.getElementById("pm-portal")?.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Reposition on scroll / resize */
  useEffect(() => {
    if (!open) return;
    const update = () => { calcPos(); };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, calcPos]);

  const go = (path) => { navigate(path); setOpen(false); };
  const handleLogout = () => { logout(); navigate("/login"); setOpen(false); };

  const adminItems = [
    { icon: LayoutDashboard, label: "Dashboard",    action: () => go("/admin") },
    { icon: User,            label: "View Profile", action: () => go("/admin/profile") },
    { icon: PenLine,         label: "Edit Profile", action: () => go("/admin/profile") },
    { icon: ShoppingBag,     label: "Orders",       action: () => go("/admin/orders") },
  ];

  const customerItems = [
    { icon: LayoutDashboard, label: "Dashboard",        action: () => go("/dashboard") },
    { icon: User,            label: "View Profile",     action: () => go("/profile") },
    { icon: PenLine,         label: "Edit Profile",     action: () => go("/edit-profile") },
    { icon: ShoppingBag,     label: "My Orders",        action: () => go("/orders") },
    { icon: FileText,        label: "My Prescriptions", action: () => go("/prescriptions") },
  ];

  const menuItems = isAdmin ? adminItems : customerItems;

  const dropdown = open && createPortal(
    <div
      id="pm-portal"
      className="pm-dropdown"
      style={{ top: pos.top, right: pos.right }}
    >
      {/* Header */}
      <div className="pm-dropdown-head">
        <div className="pm-dropdown-avatar">{initial}</div>
        <div className="pm-dropdown-meta">
          <p className="pm-dropdown-name">{user?.name}</p>
          <p className="pm-dropdown-email">{user?.email}</p>
          <span className={`pm-role-badge${isAdmin ? " pm-role-badge-admin" : ""}`}>
            {isAdmin ? "Administrator" : "Customer"}
          </span>
        </div>
      </div>

      <div className="pm-divider" />

      {/* Menu Items */}
      <div className="pm-menu">
        {menuItems.map(({ icon: Icon, label, action }) => (
          <button key={label} className="pm-item" onClick={action}>
            <span className="pm-item-icon"><Icon size={15} /></span>
            {label}
          </button>
        ))}
      </div>

      <div className="pm-divider" />

      {/* Logout */}
      <div className="pm-menu">
        <button className="pm-item pm-item-danger" onClick={handleLogout}>
          <span className="pm-item-icon"><LogOut size={15} /></span>
          Logout
        </button>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <div className="pm-wrap" ref={triggerRef}>
        <button
          className={`pm-trigger${open ? " pm-trigger-open" : ""}`}
          onClick={toggle}
          aria-label="Profile menu"
        >
          <div className="pm-avatar">{initial}</div>
          <div className="pm-info">
            <span className="pm-name">{user?.name?.split(" ")[0]}</span>
            <span className="pm-role">
              {isAdmin ? <><ShieldCheck size={9} /> Admin</> : "Customer"}
            </span>
          </div>
          <ChevronDown size={13} className={`pm-chevron${open ? " pm-chevron-open" : ""}`} />
        </button>
      </div>

      {dropdown}
    </>
  );
}
