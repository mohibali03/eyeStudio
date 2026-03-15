import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { ShoppingBag, Search, User, Package, IndianRupee, X } from "lucide-react";
import "../../styles/newDashboard.css";
import "../../styles/form.css";

const LENS_TYPES = [
  "Single Vision",
  "Bifocal",
  "Progressive",
  "Blue Light",
  "Photochromic",
  "Anti-Reflective",
];

/* ── Inline Product Search Autocomplete ── */
function ProductSearch({ products, value, onSelect }) {
  const [query, setQuery]       = useState(value?.name || "");
  const [open, setOpen]         = useState(false);
  const [highlighted, setHigh]  = useState(-1);
  const wrapRef                 = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Sync display when parent clears selection */
  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  const filtered = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  const handleKey = (e) => {
    if (!open) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHigh((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHigh((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && highlighted >= 0) { e.preventDefault(); pick(filtered[highlighted]); }
    else if (e.key === "Escape") setOpen(false);
  };

  const pick = (product) => {
    setQuery(product.name);
    setOpen(false);
    setHigh(-1);
    onSelect(product);
  };

  const clear = () => {
    setQuery("");
    onSelect(null);
    setOpen(false);
  };

  return (
    <div className="ps-wrap" ref={wrapRef}>
      <div className="ps-input-row">
        <Search size={15} className="ps-icon" />
        <input
          className="ps-input"
          placeholder="Type to search products…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHigh(-1); onSelect(null); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          autoComplete="off"
        />
        {query && (
          <button type="button" className="ps-clear" onClick={clear} tabIndex={-1}>
            <X size={13} />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className="ps-dropdown">
          {filtered.map((p, i) => (
            <li
              key={p._id}
              className={`ps-option${i === highlighted ? " ps-option-active" : ""}`}
              onMouseDown={() => pick(p)}
              onMouseEnter={() => setHigh(i)}
            >
              <div className="ps-option-main">
                <span className="ps-option-name">{p.name}</span>
                <span className="ps-option-price">₹{p.price?.toLocaleString()}</span>
              </div>
              <div className="ps-option-meta">
                <span className="ps-option-cat">{p.category}</span>
                {p.frameType && <span className="ps-option-frame">{p.frameType}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && filtered.length === 0 && (
        <div className="ps-empty">No products match "{query}"</div>
      )}
    </div>
  );
}

/* ── Main Page ── */
const CreateOrder = () => {
  const { customerId } = useParams();
  const navigate       = useNavigate();
  const { token }      = useAuth();

  const [customer,  setCustomer]  = useState(null);
  const [products,  setProducts]  = useState([]);
  const [selected,  setSelected]  = useState(null);   // chosen product object
  const [order, setOrder] = useState({
    frameType: "",
    lensType:  "",
    quantity:  1,
    price:     "",
    status:    "pending",
  });
  const [toast, setToast] = useState(null);

  /* Fetch customer name */
  useEffect(() => {
    fetch(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .catch(() => {});

    /* Fetch the specific customer by listing all and finding by id */
    fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((list) => {
        const found = Array.isArray(list) ? list.find((u) => u._id === customerId) : null;
        setCustomer(found || null);
      })
      .catch(() => {});
  }, [customerId, token]);

  /* Fetch products */
  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const handleProductSelect = (product) => {
    setSelected(product);
    setOrder((o) => ({ ...o, price: product ? product.price : "", frameType: product?.frameType || o.frameType }));
  };

  const handleChange = (e) => setOrder({ ...order, [e.target.name]: e.target.value });

  const total = selected && order.quantity && order.price
    ? Number(order.quantity) * Number(order.price)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setToast({ message: "Please select a product from the search list", type: "error" });
      return;
    }
    const res = await fetch(`${API_BASE_URL}/orders/${customerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        items: [{
          productName: selected.name,
          frameType:   order.frameType,
          lensType:    order.lensType,
          quantity:    Number(order.quantity),
          price:       Number(order.price),
        }],
        totalAmount: total,
        status:      order.status,
      }),
    });
    if (res.ok) {
      setToast({ message: "Order created successfully", type: "success" });
      setTimeout(() => navigate("/admin/manage-customers"), 1500);
    } else {
      setToast({ message: "Failed to create order", type: "error" });
    }
  };

  return (
    <AdminLayout active="customers" title="Create Order" subtitle="Add a new order for this customer">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="ds-content">
        <div className="co-card">

          {/* ── Customer Banner ── */}
          <div className="co-customer-banner">
            <div className="co-customer-avatar">
              {customer?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="co-customer-name">{customer?.name || "Loading…"}</p>
              <p className="co-customer-email">{customer?.email || ""}</p>
            </div>
            <span className="co-customer-badge"><User size={11} /> Customer</span>
          </div>

          <form onSubmit={handleSubmit} className="co-form">

            {/* ── Product Search ── */}
            <div className="co-section">
              <p className="co-section-title"><Package size={14} /> Product</p>
              <div className="co-grid-2">
                <div className="form-field co-span-2">
                  <label>Search Product <span className="co-required">*</span></label>
                  <ProductSearch
                    products={products}
                    value={selected}
                    onSelect={handleProductSelect}
                  />
                  {selected && (
                    <div className="co-selected-pill">
                      ✅ <strong>{selected.name}</strong> — {selected.category}
                      {selected.frameType && ` · ${selected.frameType}`}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label>Frame Type</label>
                  <input
                    name="frameType"
                    value={order.frameType}
                    onChange={handleChange}
                    placeholder="e.g. Full Rim, Half Rim"
                  />
                </div>

                <div className="form-field">
                  <label>Lens Type <span className="co-required">*</span></label>
                  <select name="lensType" value={order.lensType} onChange={handleChange} required>
                    <option value="">— Select Lens Type —</option>
                    {LENS_TYPES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Pricing ── */}
            <div className="co-section">
              <p className="co-section-title"><IndianRupee size={14} /> Pricing</p>
              <div className="co-grid-3">
                <div className="form-field">
                  <label>Price per item (₹)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={order.price}
                    onChange={handleChange}
                    placeholder="Auto-filled on selection"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Quantity <span className="co-required">*</span></label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={order.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Total Amount</label>
                  <div className="co-total-box">
                    ₹{total > 0 ? total.toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Order Meta ── */}
            <div className="co-section">
              <p className="co-section-title"><ShoppingBag size={14} /> Order Info</p>
              <div className="co-grid-2">
                <div className="form-field">
                  <label>Order Status</label>
                  <select name="status" value={order.status} onChange={handleChange}>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Order Date</label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    readOnly
                    style={{ background: "var(--bg)", color: "var(--muted)", cursor: "default" }}
                  />
                </div>
              </div>
            </div>

            {/* ── Summary Bar ── */}
            {total > 0 && (
              <div className="co-summary">
                <span>1 item · {order.lensType || "No lens type"} · Qty {order.quantity}</span>
                <span className="co-summary-total">Total: ₹{total.toLocaleString()}</span>
              </div>
            )}

            <div className="co-actions">
              <button type="button" className="co-cancel-btn" onClick={() => navigate("/admin/manage-customers")}>
                Cancel
              </button>
              <button type="submit" className="co-submit-btn">
                <ShoppingBag size={15} /> Create Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateOrder;
