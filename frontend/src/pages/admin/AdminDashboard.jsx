import { useEffect, useState, Component } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarCheck,
  UserCircle,
  LogOut,
  Menu,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  ClipboardList,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import ProfileMenu from "../../components/ProfileMenu";
import "../../styles/newDashboard.css";
import "../../styles/manageOrders.css";

// Error boundary — catches any render crash and shows fallback instead of blank screen
class DashboardErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#64748b", padding: 24 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#ef4444" }}>Dashboard failed to load</p>
        <p style={{ fontSize: 13 }}>{this.state.error?.message || "An unexpected error occurred."}</p>
        <button onClick={() => window.location.reload()} style={{ padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>Reload Page</button>
      </div>
    );
    return this.props.children;
  }
}

const PIE_COLORS = ["#f59e0b", "#10b981", "#ef4444"];

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

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + "18", color }}>
      <Icon size={20} />
    </div>
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value ?? "—"}</p>
    </div>
  </div>
);

const statusBadge = (s) => {
  const cls = {
    pending: "badge-pending",
    completed: "badge-completed",
    cancelled: "badge-cancelled",
  };
  return <span className={`badge ${cls[s] || ""}`}>{s}</span>;
};

export default function AdminDashboard() {
  return (
    <DashboardErrorBoundary>
      <AdminDashboardInner />
    </DashboardErrorBoundary>
  );
}

function AdminDashboardInner() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/orders/stats`, { credentials: "include" })
      .then((r) => r.json()).then(setStats).catch(() => {});
    fetch(`${API_BASE_URL}/orders`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d.slice(0, 5) : [])).catch(() => {});
    fetch(`${API_BASE_URL}/users?limit=5`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCustomers(Array.isArray(d.customers) ? d.customers : [])).catch(() => {});
  }, []);

  const pieData = stats
    ? [
        { name: "Pending", value: stats.pending },
        { name: "Completed", value: stats.completed },
        { name: "Cancelled", value: stats.cancelled },
      ]
    : [];

  return (
    <div className="ds-root">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="ds-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`ds-sidebar${collapsed ? " ds-sidebar-collapsed" : ""}${mobileOpen ? " ds-mobile-open" : ""}`}
      >
        <div className="ds-sidebar-header">
          {!collapsed && (
            <span className="ds-logo">
              <span>eye</span>Studio
            </span>
          )}
          <button
            className="ds-collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
          >
            <Menu size={18} />
          </button>
        </div>

        <ul className="ds-nav">
          {!collapsed && <li className="ds-nav-section">Main</li>}
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active
            onClick={() => navigate("/admin")}
            collapsed={collapsed}
          />
          <NavItem
            icon={Users}
            label="Customers"
            onClick={() => navigate("/admin/manage-customers")}
            collapsed={collapsed}
          />
          <NavItem
            icon={Package}
            label="Products"
            onClick={() => navigate("/admin/manage-products")}
            collapsed={collapsed}
          />
          <NavItem
            icon={ShoppingCart}
            label="Orders"
            onClick={() => {
              navigate("/admin/orders");
              setMobileOpen(false);
            }}
            collapsed={collapsed}
          />
          <NavItem
            icon={CalendarCheck}
            label="Eye Test Bookings"
            onClick={() => {
              navigate("/admin/eye-test-bookings");
              setMobileOpen(false);
            }}
            collapsed={collapsed}
          />
          {!collapsed && <li className="ds-nav-section">Account</li>}
          <NavItem
            icon={UserCircle}
            label="My Profile"
            onClick={() => navigate("/admin/profile")}
            collapsed={collapsed}
          />
        </ul>

        <div className="ds-sidebar-footer">
          <button
            className="ds-logout-btn"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            title={collapsed ? "Logout" : ""}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={`ds-main${collapsed ? " ds-main-collapsed" : ""}`}>
        {/* Topbar */}
        <header className="ds-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="ds-mobile-menu-btn"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="ds-page-title">Dashboard</p>
              <p className="ds-page-sub">
                Welcome back, {user?.name?.split(" ")[0]}
              </p>
            </div>
          </div>
          <ProfileMenu />
        </header>

        <div className="ds-content">
          {/* ── Stat Cards ── */}
          <div className="ds-stats-grid">
            <StatCard
              icon={Users}
              label="Total Customers"
              value={stats?.totalCustomers}
              color="#6366f1"
            />
            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={stats?.totalOrders}
              color="#0ea5e9"
            />
            <StatCard
              icon={IndianRupee}
              label="Total Sales"
              value={stats ? `₹${(stats.totalSales ?? 0).toLocaleString()}` : null}
              color="#10b981"
            />
            <StatCard
              icon={Package}
              label="Total Products"
              value={stats?.totalProducts}
              color="#f59e0b"
            />
          </div>

          {/* ── Charts Row ── */}
          <div className="ds-charts-row">
            {/* Line Chart */}
            <div className="ds-chart-card">
              <p className="ds-chart-title">
                <TrendingUp size={15} /> Monthly Sales & Orders
              </p>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart
                  data={stats?.monthlySales || []}
                  margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#6366f1" }}
                    name="Sales (₹)"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#0ea5e9" }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart */}
            <div className="ds-chart-card">
              <p className="ds-chart-title">
                <ClipboardList size={15} /> Orders by Status
              </p>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="ds-chart-card ds-chart-full">
            <p className="ds-chart-title">
              <ShoppingBag size={15} /> Monthly Orders Volume
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={stats?.monthlySales || []}
                margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  name="Orders"
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Tables Row ── */}
          <div className="ds-tables-row">
            {/* Recent Orders */}
            <div className="ds-table-card">
              <div className="ds-table-header">
                <h3>Recent Orders</h3>
                <button
                  className="ds-view-all"
                  onClick={() => navigate("/admin/orders")}
                >
                  View all <ChevronRight size={13} />
                </button>
              </div>
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="ds-empty">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o._id}>
                        <td>
                          <div className="ds-customer-row">
                            <div className="ds-mini-avatar">
                              {o.customer?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            {o.customer?.name || "—"}
                          </div>
                        </td>
                        <td className="ds-amount">₹{o.totalAmount}</td>
                        <td>{statusBadge(o.status)}</td>
                        <td className="ds-muted">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Recent Customers */}
            <div className="ds-table-card">
              <div className="ds-table-header">
                <h3>Recent Customers</h3>
                <button
                  className="ds-view-all"
                  onClick={() => navigate("/admin/manage-customers")}
                >
                  View all <ChevronRight size={13} />
                </button>
              </div>
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="ds-empty">
                        No customers yet
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <div className="ds-customer-row">
                            <div className="ds-mini-avatar">
                              {c.name?.[0]?.toUpperCase()}
                            </div>
                            {c.name}
                          </div>
                        </td>
                        <td className="ds-muted">{c.email}</td>
                        <td className="ds-muted">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
