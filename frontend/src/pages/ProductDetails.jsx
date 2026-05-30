import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";
import {
  Tag, Layers, ArrowLeft, CalendarCheck, Glasses,
  Share2, Copy, Check, X, ChevronLeft, ChevronRight,
  ZoomIn, Heart, ShieldCheck, Truck, RotateCcw, Twitter,
  CheckCircle2,
} from "lucide-react";
import "../styles/productdetails.css";

/* ── Dynamic OG meta injection ───────────────────────────────────────────── */
// WhatsApp / Telegram / Facebook read OG tags when a link is pasted.
// We inject them dynamically per product so each product page has its own preview.
const injectOGMeta = (product, imageUrl, pageUrl) => {
  const set = (prop, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
    el.setAttribute("content", content);
  };
  const setName = (name, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
  };

  const title       = `${product.name} — eyeStudio`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} | ₹${product.price.toLocaleString()} | ${product.category} | eyeStudio Optical`;

  document.title = title;
  set("og:title",       title);
  set("og:description", description);
  set("og:image",       imageUrl || "");
  set("og:url",         pageUrl);
  set("og:type",        "product");
  set("og:site_name",   "eyeStudio");
  setName("description",       description);
  setName("twitter:card",      "summary_large_image");
  setName("twitter:title",     title);
  setName("twitter:description", description);
  setName("twitter:image",     imageUrl || "");
};

/* ── Fetch image URL → File object (for Web Share API files) ─────────────── */
const urlToFile = async (imageUrl, filename = "product.jpg") => {
  // Proxy through a CORS-friendly approach: fetch the image as blob
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const ext  = blob.type.split("/")[1] || "jpg";
  return new File([blob], `${filename}.${ext}`, { type: blob.type });
};

/* ── Toast notification ──────────────────────────────────────────────────── */
const ShareToast = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="share-toast">
      <CheckCircle2 size={16} />
      <span>{message}</span>
    </div>
  );
};

/* ── Share Modal ─────────────────────────────────────────────────────────── */
const ShareModal = ({ product, imageUrl, onClose, onToast }) => {
  const [copied, setCopied] = useState(false);
  const url  = window.location.href;
  const desc = product.description ? product.description.slice(0, 100) + "…" : "";
  const text = `👓 *${product.name}*\n💰 ₹${product.price.toLocaleString()}\n${desc}\n\n🛍️ Shop now: ${url}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    onToast("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    onToast("Product details copied!");
  };

  const shareLinks = [
    {
      label: "WhatsApp",
      bg: "#25d366",
      // WhatsApp uses OG tags for image preview — the text includes the URL
      href: `https://wa.me/?text=${encodeURIComponent(text)}`,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.571a.5.5 0 0 0 .612.612l5.726-1.471A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.513-5.228-1.407l-.374-.22-3.878.996.996-3.878-.22-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      ),
    },
    {
      label: "Telegram",
      bg: "#0088cc",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`👓 ${product.name}\n₹${product.price.toLocaleString()}\n${desc}`)}`,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.667l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.892z"/>
        </svg>
      ),
    },
    {
      label: "Facebook",
      bg: "#1877f2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
      ),
    },
    {
      label: "Twitter",
      bg: "#000",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`👓 ${product.name} — ₹${product.price.toLocaleString()}\n${url}`)}`,
      icon: <Twitter size={22} />,
    },
    {
      label: "Email",
      bg: "#ea4335",
      href: `mailto:?subject=${encodeURIComponent(product.name + " — eyeStudio")}&body=${encodeURIComponent(text)}`,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>Share Product</h3>
          <button className="share-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Product preview card */}
        <div className="share-preview">
          {imageUrl
            ? <img src={imageUrl} alt={product.name} className="share-preview-img" />
            : <div className="share-preview-img-placeholder"><Glasses size={28} /></div>
          }
          <div className="share-preview-info">
            <p className="share-preview-name">{product.name}</p>
            <p className="share-preview-price">₹{product.price.toLocaleString()}</p>
            {product.category && <span className="share-preview-cat">{product.category}</span>}
          </div>
        </div>

        {/* OG note */}
        <p className="share-og-note">
          📸 When you share the link on WhatsApp or Telegram, the product image will appear automatically as a preview.
        </p>

        {/* Social buttons */}
        <p className="share-section-label">Share via</p>
        <div className="share-socials">
          {shareLinks.map(({ label, bg, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="share-social-btn"
              style={{ "--social-bg": bg }}
              onClick={() => onToast(`Opening ${label}…`)}
            >
              <span className="share-social-icon">{icon}</span>
              <span>{label}</span>
            </a>
          ))}
        </div>

        {/* Copy options */}
        <p className="share-section-label">Copy</p>
        <div className="share-copy-row">
          <span className="share-copy-url">{url}</span>
          <button className={`share-copy-btn${copied ? " copied" : ""}`} onClick={copy}>
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Link</>}
          </button>
        </div>
        <button className="share-copy-details-btn" onClick={copyText}>
          <Copy size={13} /> Copy product details
        </button>
      </div>
    </div>
  );
};

/* ── Image Gallery ───────────────────────────────────────────────────────── */
const ImageGallery = ({ images, productName }) => {
  const [active, setActive]     = useState(0);
  const [zoomed, setZoomed]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [animDir, setAnimDir]   = useState("");
  const touchStartX             = useRef(null);

  const go = useCallback((idx, dir = "") => {
    setImgLoaded(false);
    setAnimDir(dir);
    setActive(idx);
  }, []);

  const prev = () => go((active - 1 + images.length) % images.length, "left");
  const next = () => go((active + 1) % images.length, "right");

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  if (!images.length) return (
    <div className="gallery-root">
      <div className="gallery-empty"><Glasses size={72} /><p>No image available</p></div>
    </div>
  );

  return (
    <div className="gallery-root">
      <div
        className={`gallery-main${zoomed ? " gallery-zoomed" : ""}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => setZoomed((z) => !z)}
        title={zoomed ? "Click to zoom out" : "Click to zoom in"}
      >
        {!imgLoaded && <div className="gallery-skeleton" />}
        <img
          key={active}
          src={images[active]}
          alt={`${productName} — view ${active + 1}`}
          className={`gallery-main-img anim-${animDir}${imgLoaded ? " loaded" : ""}`}
          onLoad={() => setImgLoaded(true)}
        />
        {imgLoaded && !zoomed && <div className="gallery-zoom-hint"><ZoomIn size={14} /> Zoom</div>}
        {images.length > 1 && (
          <>
            <button className="gallery-arrow gallery-arrow-left" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous image"><ChevronLeft size={20} /></button>
            <button className="gallery-arrow gallery-arrow-right" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image"><ChevronRight size={20} /></button>
          </>
        )}
        {images.length > 1 && (
          <div className="gallery-dots">
            {images.map((_, i) => (
              <button key={i} className={`gallery-dot${i === active ? " active" : ""}`} onClick={(e) => { e.stopPropagation(); go(i); }} aria-label={`Go to image ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button key={i} className={`gallery-thumb${i === active ? " active" : ""}`} onClick={() => go(i, i > active ? "right" : "left")} aria-label={`View image ${i + 1}`}>
              <img src={src} alt={`thumb-${i}`} loading="lazy" />
              {i === 0 && <span className="thumb-main-badge">Main</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Trust Badges ────────────────────────────────────────────────────────── */
const BADGE_ICON_MAP = {
  "Authentic Product": <ShieldCheck size={16} />,
  "Free Delivery":     <Truck size={16} />,
  "Easy Returns":      <RotateCcw size={16} />,
};

const TrustBadges = ({ badges }) => {
  if (!badges?.length) return null;
  return (
    <div className="trust-badges">
      {badges.map((label) => (
        <div key={label} className="trust-badge">
          {BADGE_ICON_MAP[label] ?? <ShieldCheck size={16} />}
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Loading Skeleton ────────────────────────────────────────────────────── */
const PageSkeleton = () => (
  <>
    <Header />
    <div className="product-details-page">
      <div className="product-details-wrapper">
        <div className="skeleton-gallery">
          <div className="skeleton-main" />
          <div className="skeleton-thumbs">{[0,1,2].map(i => <div key={i} className="skeleton-thumb" />)}</div>
        </div>
        <div className="skeleton-info">
          <div className="skeleton-line w40" />
          <div className="skeleton-line w80" />
          <div className="skeleton-line w60" />
          <div className="skeleton-line w30 price" />
          <div className="skeleton-line w100" />
          <div className="skeleton-line w90" />
          <div className="skeleton-btns"><div className="skeleton-btn" /><div className="skeleton-btn" /></div>
        </div>
      </div>
    </div>
    <Footer />
  </>
);

/* ── Main Page ───────────────────────────────────────────────────────────── */
const ProductDetails = () => {
  const { id }                          = useParams();
  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showShare, setShowShare]       = useState(false);
  const [wishlisted, setWishlisted]     = useState(false);
  const [toast, setToast]               = useState("");
  const [sharing, setSharing]           = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d);
        setLoading(false);
        // Inject OG meta as soon as product loads
        const imgs = d.images?.length ? d.images : (d.imageUrl ? [d.imageUrl] : []);
        injectOGMeta(d, imgs[0] || "", window.location.href);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  const handleShare = useCallback(async () => {
    if (!product || sharing) return;
    const images  = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : []);
    const imgUrl  = images[0] || "";
    const pageUrl = window.location.href;
    const title   = `${product.name} — eyeStudio`;
    const text    = `👓 ${product.name}\n₹${product.price.toLocaleString()}\n${product.description ? product.description.slice(0, 80) + "…" : ""}\n\n🛍️ Shop now: ${pageUrl}`;

    // ── Strategy 1: Web Share API with image file (mobile Chrome/Safari) ──
    if (navigator.share && imgUrl) {
      try {
        setSharing(true);
        const file = await urlToFile(imgUrl, product.name.replace(/\s+/g, "-").toLowerCase());
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title, text });
          showToast("Product shared successfully!");
          setSharing(false);
          return;
        }
      } catch {
        // File share failed or cancelled — fall through to text share
      } finally {
        setSharing(false);
      }
    }

    // ── Strategy 2: Web Share API text + URL only (no image file) ──
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: pageUrl });
        showToast("Product shared successfully!");
        return;
      } catch {
        // User cancelled or not supported — fall through to modal
      }
    }

    // ── Strategy 3: Desktop share modal ──
    setShowShare(true);
  }, [product, sharing, showToast]);

  if (loading) return <PageSkeleton />;

  if (!product) return (
    <>
      <Header />
      <div className="pd-not-found">
        <Glasses size={56} />
        <h2>Product not found</h2>
        <p>This product may have been removed or the link is incorrect.</p>
        <Link to="/products" className="pd-back-link">← Back to Products</Link>
      </div>
      <Footer />
    </>
  );

  const images = product.images?.length
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <>
      <Header />

      {/* Success toast */}
      {toast && <ShareToast message={toast} onDone={() => setToast("")} />}

      {showShare && (
        <ShareModal
          product={product}
          imageUrl={images[0]}
          onClose={() => setShowShare(false)}
          onToast={showToast}
        />
      )}

      <div className="product-details-page">
        <nav className="pd-breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to="/products">Products</Link><span>/</span>
          <span className="pd-breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-details-wrapper">
          <ImageGallery images={images} productName={product.name} />

          <div className="product-details-info">
            <div className="pd-top-row">
              <span className="product-details-badge"><Tag size={11} /> {product.category}</span>
              <button
                className={`pd-wishlist-btn${wishlisted ? " wishlisted" : ""}`}
                onClick={() => setWishlisted((w) => !w)}
                aria-label="Add to wishlist"
              >
                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-meta">
              {product.frameType && (
                <div className="pd-meta-item">
                  <span className="pd-meta-label">Frame Type</span>
                  <span className="pd-meta-value">{product.frameType}</span>
                </div>
              )}
              <div className="pd-meta-item">
                <span className="pd-meta-label">Collection</span>
                <span className="pd-meta-value"><Layers size={12} /> {product.category}</span>
              </div>
            </div>

            <div className="pd-price-row">
              <span className="pd-price">₹{product.price.toLocaleString()}</span>
              <span className="pd-price-note">Inclusive of all taxes</span>
            </div>

            {product.description && (
              <div className="pd-desc">
                <h3>About this product</h3>
                <p>{product.description}</p>
              </div>
            )}

            <TrustBadges badges={product.trustBadges} />

            <div className="pd-actions">
              <Link to="/book-test" className="pd-btn-primary">
                <CalendarCheck size={16} /> Book Eye Test
              </Link>
              <button
                className={`pd-btn-share${sharing ? " sharing" : ""}`}
                onClick={handleShare}
                disabled={sharing}
              >
                <Share2 size={16} />
                {sharing ? "Sharing…" : "Share"}
              </button>
            </div>

            <Link to="/products" className="pd-back-link-inline">
              <ArrowLeft size={14} /> Back to Products
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetails;
