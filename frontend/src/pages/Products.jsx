import { useEffect, useState, useMemo, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import {
  SlidersHorizontal, Glasses, ArrowRight, X, ChevronDown,
  ChevronUp, Search, ShieldCheck, Truck, RotateCcw,
} from "lucide-react";
import "../styles/products.css";

// ── Filter config ─────────────────────────────────────────────────────────────
const FILTER_DEFS = [
  { key: "category",       label: "Gender",           options: ["Men", "Women", "Kids", "Unisex"] },
  { key: "frameShape",     label: "Shape & Style",    options: ["Round", "Square", "Rectangle", "Cat Eye", "Aviator", "Wayfarer", "Geometric", "Oval", "Hexagonal"] },
  { key: "frameType",      label: "Frame Type",       options: ["Full Rim", "Half Rim", "Rimless"] },
  { key: "frameSize",      label: "Frame Size",       options: ["Small", "Medium", "Large"] },
  { key: "frameColor",     label: "Frame Color",      options: ["Black", "Blue", "Brown", "Silver", "Gold", "Transparent", "Red", "Green", "Pink", "White"] },
  { key: "material",       label: "Material",         options: ["Metal", "Plastic", "Titanium", "Acetate", "TR90", "Wood"] },
  { key: "weight",         label: "Weight",           options: ["Lightweight", "Medium", "Heavy"] },
  { key: "faceShape",      label: "Face Shape",       options: ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"] },
  { key: "occasion",       label: "Occasion",         options: ["Casual", "Office", "Party", "Sports", "Travel"] },
  { key: "clothesMatcher", label: "Clothes Matcher",  options: ["Formal", "Casual", "Ethnic", "Streetwear", "Sporty"] },
  { key: "looksFinder",    label: "Looks Finder",     options: ["Professional", "Trendy", "Minimal", "Luxury", "Sporty"] },
  { key: "vibeCheck",      label: "Vibe Check",       options: ["Classic", "Cool", "Bold", "Elegant", "Quirky"] },
  { key: "countryOfOrigin",label: "Country of Origin",options: ["India", "USA", "Japan", "Italy", "China", "Germany"] },
  { key: "computerGlasses",label: "Computer Glasses", options: ["Yes", "No"] },
];

const PRICE_RANGES = [
  { label: "Under ₹1,000",      min: 0,    max: 999 },
  { label: "₹1,000 – ₹2,000",  min: 1000, max: 2000 },
  { label: "₹2,000 – ₹5,000",  min: 2000, max: 5000 },
  { label: "Above ₹5,000",      min: 5000, max: Infinity },
];

const TRUST_ICONS = {
  "Free Shipping":    <Truck size={13} />,
  "1 Year Warranty":  <ShieldCheck size={13} />,
  "Easy Return":      <RotateCcw size={13} />,
  "UV Protection":    <ShieldCheck size={13} />,
};

// ── FilterGroup component ─────────────────────────────────────────────────────
const FilterGroup = ({ label, options, selected, onChange, dynamic = false }) => {
  const [open, setOpen] = useState(true);
  const count = selected.length;

  return (
    <div className="filter-group">
      <button className="filter-group-header" onClick={() => setOpen(o => !o)}>
        <span className="filter-group-label">
          {label}
          {count > 0 && <span className="filter-count">{count}</span>}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="filter-options">
          {options.map(opt => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                className={`filter-chip${active ? " active" : ""}`}
                onClick={() => onChange(opt)}
              >
                {opt}
                {active && <X size={10} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Products = () => {
  const [allProducts, setAllProducts]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [priceRange, setPriceRange]     = useState(null); // { min, max } | null
  const [filters, setFilters]           = useState({}); // { key: [values] }

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(r => r.json())
      .then(d => { setAllProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Build dynamic brand list from products
  const brands = useMemo(() => {
    const set = new Set(allProducts.map(p => p.brand).filter(Boolean));
    return [...set].sort();
  }, [allProducts]);

  const toggleFilter = useCallback((key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const clearAll = () => { setFilters({}); setPriceRange(null); setSearch(""); };

  const totalActiveFilters = useMemo(() => {
    return Object.values(filters).reduce((s, arr) => s + arr.length, 0)
      + (priceRange ? 1 : 0)
      + (search ? 1 : 0);
  }, [filters, priceRange, search]);

  // ── Filtering logic ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allProducts.filter(p => {
      // Search
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.brand?.toLowerCase().includes(search.toLowerCase())) return false;

      // Price
      if (priceRange && (p.price < priceRange.min || p.price > priceRange.max)) return false;

      // Computer glasses special case
      const cgFilter = filters.computerGlasses || [];
      if (cgFilter.length > 0) {
        const want = cgFilter.includes("Yes");
        if (want !== !!p.computerGlasses) return false;
      }

      // All other filters
      for (const def of FILTER_DEFS) {
        if (def.key === "computerGlasses") continue;
        const selected = filters[def.key] || [];
        if (selected.length === 0) continue;

        const val = p[def.key];
        if (!val) return false;

        // Array fields (frameColor, faceShape, occasion, etc.)
        if (Array.isArray(val)) {
          if (!selected.some(s => val.includes(s))) return false;
        } else {
          // String fields
          if (!selected.includes(val)) return false;
        }
      }

      return true;
    });
  }, [allProducts, search, priceRange, filters]);

  const imgSrc = (p) => {
    const url = p.images?.[0] || p.imageUrl;
    if (!url) return null;
    return url.startsWith("http") ? url : `http://localhost:5000${url}`;
  };

  const SidebarContent = () => (
    <div className="sidebar-inner">
      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">
          <SlidersHorizontal size={15} /> Filters
          {totalActiveFilters > 0 && <span className="filter-total-badge">{totalActiveFilters}</span>}
        </span>
        {totalActiveFilters > 0 && (
          <button className="clear-all-btn" onClick={clearAll}>Clear All</button>
        )}
      </div>

      {/* Search */}
      <div className="filter-search-wrap">
        <Search size={14} className="filter-search-icon" />
        <input
          className="filter-search-input"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button className="filter-search-clear" onClick={() => setSearch("")}><X size={12} /></button>}
      </div>

      {/* Price */}
      <div className="filter-group">
        <button className="filter-group-header" onClick={() => {}}>
          <span className="filter-group-label">
            Price Range
            {priceRange && <span className="filter-count">1</span>}
          </span>
        </button>
        <div className="filter-options">
          {PRICE_RANGES.map(r => (
            <button
              key={r.label}
              className={`filter-chip${priceRange?.label === r.label ? " active" : ""}`}
              onClick={() => setPriceRange(prev => prev?.label === r.label ? null : { ...r })}
            >
              {r.label}
              {priceRange?.label === r.label && <X size={10} />}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic brand filter */}
      {brands.length > 0 && (
        <FilterGroup
          label="Brand"
          options={brands}
          selected={filters.brand || []}
          onChange={v => toggleFilter("brand", v)}
        />
      )}

      {/* All other filters */}
      {FILTER_DEFS.map(def => (
        <FilterGroup
          key={def.key}
          label={def.label}
          options={def.options}
          selected={filters[def.key] || []}
          onChange={v => toggleFilter(def.key, v)}
        />
      ))}
    </div>
  );

  return (
    <>
      <Header />
      <div className="products-page">

        {/* Page header */}
        <div className="products-page-header">
          <div>
            <h1>Eyewear Collection</h1>
            <p>{loading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}</p>
          </div>
          <button className="mobile-filter-btn" onClick={() => setMobileOpen(true)}>
            <SlidersHorizontal size={15} />
            Filters
            {totalActiveFilters > 0 && <span className="filter-total-badge">{totalActiveFilters}</span>}
          </button>
        </div>

        <div className="products-wrapper">

          {/* Desktop sidebar */}
          <aside className="products-sidebar">
            <SidebarContent />
          </aside>

          {/* Mobile drawer */}
          {mobileOpen && (
            <div className="mobile-filter-overlay" onClick={() => setMobileOpen(false)}>
              <div className="mobile-filter-drawer" onClick={e => e.stopPropagation()}>
                <div className="mobile-filter-drawer-header">
                  <span>Filters</span>
                  <button onClick={() => setMobileOpen(false)}><X size={18} /></button>
                </div>
                <div className="mobile-filter-drawer-body">
                  <SidebarContent />
                </div>
                <div className="mobile-filter-drawer-footer">
                  <button className="mobile-apply-btn" onClick={() => setMobileOpen(false)}>
                    Show {filtered.length} Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="products-grid">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-info">
                    <div className="skeleton-line w70" />
                    <div className="skeleton-line w40" />
                    <div className="skeleton-line w50" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="no-products">
                <Glasses size={48} />
                <p>No products match your filters.</p>
                {totalActiveFilters > 0 && (
                  <button className="clear-all-btn-inline" onClick={clearAll}>Clear all filters</button>
                )}
              </div>
            ) : filtered.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {imgSrc(product)
                    ? <img src={imgSrc(product)} alt={product.name} loading="lazy" />
                    : <div className="placeholder-image"><Glasses size={52} /></div>
                  }
                  {product.computerGlasses && (
                    <span className="product-badge-overlay">Blue Light</span>
                  )}
                </div>
                <div className="product-info">
                  {product.brand && <p className="product-brand">{product.brand}</p>}
                  <h3>{product.name}</h3>
                  <div className="product-tags">
                    <span className="product-category">{product.category}</span>
                    {product.frameShape && <span className="product-tag">{product.frameShape}</span>}
                    {product.frameType && <span className="product-tag">{product.frameType}</span>}
                  </div>
                  <p className="product-price">₹{product.price.toLocaleString()}</p>
                  {product.trustBadges?.length > 0 && (
                    <div className="product-trust-row">
                      {product.trustBadges.slice(0, 2).map(b => (
                        <span key={b} className="product-trust-chip">
                          {TRUST_ICONS[b] || <ShieldCheck size={11} />} {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link to={`/products/${product._id}`} className="view-btn">
                    View Details <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;
