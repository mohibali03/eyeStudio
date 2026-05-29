import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import { Package, Upload, X, Tag } from "lucide-react";
import "../../styles/newDashboard.css";
import "../../styles/form.css";

const MAX_FILES = 6;
const MAX_SIZE  = 5 * 1024 * 1024;
const ALLOWED   = ["image/jpeg", "image/png", "image/webp"];

// ── Multi-select chip picker ──────────────────────────────────────────────────
const ChipPicker = ({ label, options, selected, onChange }) => (
  <div className="form-field">
    <label>{label}</label>
    <div className="chip-picker">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            className={`form-chip${active ? " active" : ""}`}
            onClick={() => onChange(active ? selected.filter(v => v !== opt) : [...selected, opt])}
          >
            {opt}{active && <X size={10} />}
          </button>
        );
      })}
    </div>
  </div>
);

// ── Single-select chip picker ─────────────────────────────────────────────────
const SingleChipPicker = ({ label, options, value, onChange }) => (
  <div className="form-field">
    <label>{label}</label>
    <div className="chip-picker">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          className={`form-chip${value === opt ? " active" : ""}`}
          onClick={() => onChange(value === opt ? "" : opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const TRUST_BADGE_OPTIONS = [
  "Free Shipping", "1 Year Warranty", "Easy Return",
  "COD Available", "Premium Quality", "UV Protection",
  "Anti-Glare", "Blue Light Block", "Scratch Resistant",
];

const FRAME_SHAPES  = ["Round", "Square", "Rectangle", "Cat Eye", "Aviator", "Wayfarer", "Geometric", "Oval", "Hexagonal"];
const FRAME_COLORS  = ["Black", "Blue", "Brown", "Silver", "Gold", "Transparent", "Red", "Green", "Pink", "White"];
const MATERIALS     = ["Metal", "Plastic", "Titanium", "Acetate", "TR90", "Wood"];
const FACE_SHAPES   = ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"];
const OCCASIONS     = ["Casual", "Office", "Party", "Sports", "Travel"];
const CLOTHES       = ["Formal", "Casual", "Ethnic", "Streetwear", "Sporty"];
const LOOKS         = ["Professional", "Trendy", "Minimal", "Luxury", "Sporty"];
const VIBES         = ["Classic", "Cool", "Bold", "Elegant", "Quirky"];
const COUNTRIES     = ["India", "USA", "Japan", "Italy", "China", "Germany"];

const EMPTY = {
  name: "", price: "", category: "Men", brand: "",
  frameType: "", frameShape: "", frameSize: "", frameColor: [],
  material: "", weight: "", faceShape: [], occasion: [],
  clothesMatcher: [], looksFinder: [], vibeCheck: [],
  countryOfOrigin: "", computerGlasses: false,
  description: "", trustBadges: [],
};

const CreateProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct]       = useState(EMPTY);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews]     = useState([]);
  const [toast, setToast]           = useState(null);
  const [saving, setSaving]         = useState(false);

  const set = (key, val) => setProduct(p => ({ ...p, [key]: val }));
  const handleChange = e => set(e.target.name, e.target.type === "checkbox" ? e.target.checked : e.target.value);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    const valid = [];
    for (const f of selected) {
      if (!ALLOWED.includes(f.type)) { setToast({ message: `${f.name}: unsupported format.`, type: "error" }); continue; }
      if (f.size > MAX_SIZE)         { setToast({ message: `${f.name}: exceeds 5 MB.`, type: "error" }); continue; }
      valid.push(f);
    }
    const combined = [...imageFiles, ...valid].slice(0, MAX_FILES);
    setImageFiles(combined);
    setPreviews(combined.map(f => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removeImage = (idx) => {
    const files = imageFiles.filter((_, i) => i !== idx);
    setImageFiles(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let images = [];

    if (imageFiles.length > 0) {
      try {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append("images", f));
        const up = await authFetch(`${API_BASE_URL}/products/upload-multiple`, { method: "POST", body: fd });
        const upData = await up.json();
        if (!up.ok) { setToast({ message: upData.message || "Upload failed", type: "error" }); setSaving(false); return; }
        images = upData.imageUrls;
      } catch {
        setToast({ message: "Image upload failed: network error", type: "error" }); setSaving(false); return;
      }
    }

    const res = await authFetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, imageUrl: images[0] || "", images, price: Number(product.price) }),
    });

    if (res.ok) {
      setToast({ message: "Product created successfully", type: "success" });
      setTimeout(() => navigate("/admin/manage-products"), 1500);
    } else {
      setToast({ message: "Failed to create product", type: "error" });
    }
    setSaving(false);
  };

  return (
    <AdminLayout active="products">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <header className="ds-topbar">
        <div>
          <p className="ds-page-title">Create Product</p>
          <p className="ds-page-sub">Add a new product to your inventory</p>
        </div>
      </header>

      <div className="ds-content">
        <form onSubmit={handleSubmit} className="cp-form">

          {/* ── Section: Basic Info ── */}
          <div className="cp-section">
            <div className="cp-section-title"><Package size={15} /> Basic Information</div>
            <div className="cp-grid-2">
              <div className="form-field cp-span-2">
                <label>Product Name *</label>
                <input name="name" placeholder="e.g. Ray-Ban Aviator Classic" onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Price (₹) *</label>
                <input name="price" type="number" min="0" placeholder="0" onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Brand</label>
                <input name="brand" placeholder="e.g. Ray-Ban, Lenskart" onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Category *</label>
                <select name="category" onChange={handleChange}>
                  {["Men", "Women", "Kids", "Unisex"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Country of Origin</label>
                <select name="countryOfOrigin" onChange={handleChange}>
                  <option value="">— Select —</option>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field cp-span-2">
                <label>Description</label>
                <textarea name="description" placeholder="Describe the product…" onChange={handleChange} rows={3} />
              </div>
            </div>
          </div>

          {/* ── Section: Frame Details ── */}
          <div className="cp-section">
            <div className="cp-section-title"><Tag size={15} /> Frame Details</div>
            <div className="cp-grid-2">
              <SingleChipPicker label="Frame Type"  options={["Full Rim", "Half Rim", "Rimless"]}    value={product.frameType}  onChange={v => set("frameType", v)} />
              <SingleChipPicker label="Frame Shape" options={FRAME_SHAPES}                            value={product.frameShape} onChange={v => set("frameShape", v)} />
              <SingleChipPicker label="Frame Size"  options={["Small", "Medium", "Large"]}            value={product.frameSize}  onChange={v => set("frameSize", v)} />
              <SingleChipPicker label="Material"    options={MATERIALS}                               value={product.material}   onChange={v => set("material", v)} />
              <SingleChipPicker label="Weight"      options={["Lightweight", "Medium", "Heavy"]}      value={product.weight}     onChange={v => set("weight", v)} />
              <ChipPicker       label="Frame Color" options={FRAME_COLORS}                            selected={product.frameColor} onChange={v => set("frameColor", v)} />
            </div>
          </div>

          {/* ── Section: Style & Fit ── */}
          <div className="cp-section">
            <div className="cp-section-title">✨ Style & Fit</div>
            <div className="cp-grid-2">
              <ChipPicker label="Best for Face Shape" options={FACE_SHAPES} selected={product.faceShape}      onChange={v => set("faceShape", v)} />
              <ChipPicker label="Occasion"            options={OCCASIONS}   selected={product.occasion}       onChange={v => set("occasion", v)} />
              <ChipPicker label="Clothes Matcher"     options={CLOTHES}     selected={product.clothesMatcher} onChange={v => set("clothesMatcher", v)} />
              <ChipPicker label="Looks Finder"        options={LOOKS}       selected={product.looksFinder}    onChange={v => set("looksFinder", v)} />
              <ChipPicker label="Vibe Check"          options={VIBES}       selected={product.vibeCheck}      onChange={v => set("vibeCheck", v)} />
              <div className="form-field">
                <label>Computer / Blue Light Glasses</label>
                <label className="toggle-label">
                  <input type="checkbox" name="computerGlasses" checked={product.computerGlasses} onChange={handleChange} />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                  <span>{product.computerGlasses ? "Yes" : "No"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Section: Trust Badges ── */}
          <div className="cp-section">
            <div className="cp-section-title">🛡️ Trust Badges</div>
            <ChipPicker label="Select badges to display on product page" options={TRUST_BADGE_OPTIONS} selected={product.trustBadges} onChange={v => set("trustBadges", v)} />
          </div>

          {/* ── Section: Images ── */}
          <div className="cp-section">
            <div className="cp-section-title"><Upload size={15} /> Product Images</div>
            <div className="form-field">
              <label>Upload Images <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(up to {MAX_FILES}, max 5 MB each)</span></label>
              <label className={`upload-zone${imageFiles.length >= MAX_FILES ? " disabled" : ""}`}>
                <Upload size={20} />
                <span>{imageFiles.length === 0 ? "Click to upload images" : `${imageFiles.length} selected — click to add more`}</span>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} disabled={imageFiles.length >= MAX_FILES} onChange={handleFileSelect} />
              </label>
              {previews.length > 0 && (
                <div className="image-preview-grid">
                  {previews.map((src, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={src} alt={`preview-${i}`} />
                      <button type="button" className="image-remove-btn" onClick={() => removeImage(i)}>
                        <X size={11} color="#fff" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="form-submit-btn" disabled={saving}>
            {saving ? "Saving…" : "Create Product"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateProduct;
