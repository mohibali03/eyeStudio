import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";
import { Tag, Layers, ArrowLeft, CalendarCheck, Glasses, Share2, Copy, Check, X } from "lucide-react";
import "../styles/productdetails.css";

/* ── Share Modal (desktop fallback) ──────────────────────────────────────── */
const ShareModal = ({ product, imageUrl, onClose }) => {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const text = `${product.name} — ₹${product.price.toLocaleString()}\n${product.description || ""}\n${url}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      label: "WhatsApp",
      color: "#25d366",
      href: `https://wa.me/?text=${encodeURIComponent(text)}`,
      icon: "💬",
    },
    {
      label: "Facebook",
      color: "#1877f2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: "📘",
    },
    {
      label: "Email",
      color: "#ea4335",
      href: `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(text)}`,
      icon: "✉️",
    },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "var(--surface,#fff)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Share Product</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><X size={20} /></button>
        </div>

        {imageUrl && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, background: "var(--bg,#f8fafc)", borderRadius: 10, marginBottom: 20 }}>
            <img src={imageUrl} alt={product.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{product.name}</p>
              <p style={{ margin: 0, color: "var(--primary,#2563eb)", fontWeight: 700, fontSize: 13 }}>₹{product.price.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {shareLinks.map(({ label, color, href, icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 8px", background: color + "15", borderRadius: 10, textDecoration: "none", color, fontWeight: 600, fontSize: 12, transition: "transform .15s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = ""}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>{label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", background: "var(--bg,#f8fafc)", borderRadius: 8, border: "1px solid var(--border,#e2e8f0)" }}>
          <span style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
          <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: copied ? "#10b981" : "var(--primary,#2563eb)", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "background .2s" }}>
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Link</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Image Gallery ───────────────────────────────────────────────────────── */
const ImageGallery = ({ images }) => {
  const [active, setActive] = useState(0);

  if (!images.length) return (
    <div className="product-details-image">
      <div className="placeholder-large"><Glasses size={80} /></div>
    </div>
  );

  return (
    <div className="gallery-root">
      {/* Main image */}
      <div className="gallery-main">
        <img src={images[active]} alt={`product-${active}`} key={active} className="gallery-main-img" />
      </div>

      {/* Thumbnails — only show if more than 1 image */}
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`gallery-thumb${i === active ? " gallery-thumb-active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt={`thumb-${i}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main Page ───────────────────────────────────────────────────────────── */
const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products/${id}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleShare = useCallback(async () => {
    if (!product) return;
    const images = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : []);
    const shareData = {
      title: product.name,
      text: `${product.name} — ₹${product.price.toLocaleString()}\n${product.description || ""}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch { /* user cancelled */ return; }
    }
    setShowShare(true);
  }, [product]);

  if (loading) return (
    <><Header /><div className="loading">Loading...</div><Footer /></>
  );

  if (!product) return (
    <><Header />
    <div className="not-found">
      <Glasses size={48} style={{ opacity: .3 }} />
      <h2 style={{ fontSize: 22, color: "var(--text-secondary)" }}>Product not found</h2>
      <Link to="/products" className="back-btn" style={{ display: "inline-block", padding: "10px 20px" }}>Back to Products</Link>
    </div>
    <Footer /></>
  );

  const images = product.images?.length
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <>
      <Header />
      {showShare && <ShareModal product={product} imageUrl={images[0]} onClose={() => setShowShare(false)} />}

      <div className="product-details-page">
        <div className="product-details-wrapper">
          <ImageGallery images={images} />

          <div className="product-details-info">
            <div className="product-details-badge"><Tag size={12} /> {product.category}</div>
            <h1>{product.name}</h1>

            <div className="product-meta">
              {product.frameType && <span><strong>Frame Type:</strong> {product.frameType}</span>}
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Layers size={13} /> {product.category} Collection</span>
            </div>

            <p className="product-details-price">₹{product.price.toLocaleString()}</p>

            {product.description && (
              <div className="product-details-desc">
                <h3>About this product</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="action-buttons">
              <Link to="/book-test" className="book-btn">
                <CalendarCheck size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                Book Eye Test
              </Link>
              <button className="share-btn" onClick={handleShare}>
                <Share2 size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                Share
              </button>
              <Link to="/products" className="back-btn">
                <ArrowLeft size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetails;
