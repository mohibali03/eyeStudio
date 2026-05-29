import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import { Package, Upload, X } from "lucide-react";
import "../../styles/newDashboard.css";
import "../../styles/form.css";

const MAX_FILES  = 6;
const MAX_SIZE   = 5 * 1024 * 1024; // 5 MB
const ALLOWED    = ["image/jpeg", "image/png", "image/webp"];

const CreateProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct]     = useState({ name: "", price: "", category: "Men", frameType: "", description: "" });
  const [imageFiles, setImageFiles] = useState([]);   // File[]
  const [previews, setPreviews]   = useState([]);     // blob URL[]
  const [toast, setToast]         = useState(null);
  const [saving, setSaving]       = useState(false);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    const valid = [];
    for (const f of selected) {
      if (!ALLOWED.includes(f.type)) { setToast({ message: `${f.name}: unsupported format. Use JPG, PNG or WebP.`, type: "error" }); continue; }
      if (f.size > MAX_SIZE)         { setToast({ message: `${f.name}: exceeds 5 MB limit.`, type: "error" }); continue; }
      valid.push(f);
    }
    const combined = [...imageFiles, ...valid].slice(0, MAX_FILES);
    setImageFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removeImage = (idx) => {
    const files = imageFiles.filter((_, i) => i !== idx);
    setImageFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let images = [];

    if (imageFiles.length > 0) {
      try {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("images", f));
        const up = await authFetch(`${API_BASE_URL}/products/upload-multiple`, {
          method: "POST", body: fd,
        });
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
        <div className="ds-table-card" style={{ maxWidth: 600 }}>
          <div className="ds-table-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><Package size={16} color="var(--primary)" /> Product Details</h3>
          </div>
          <form onSubmit={handleSubmit} className="form-body">
            <div className="form-field">
              <label>Product Name</label>
              <input name="name" placeholder="e.g. Ray-Ban Aviator Classic" onChange={handleChange} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-field">
                <label>Price (₹)</label>
                <input name="price" type="number" placeholder="0" onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Category</label>
                <select name="category" onChange={handleChange}>
                  {["Men", "Women", "Kids", "Unisex"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Frame Type</label>
              <input name="frameType" placeholder="e.g. Full Rim, Half Rim, Rimless" onChange={handleChange} />
            </div>

            {/* ── Multi-image upload ── */}
            <div className="form-field">
              <label>Product Images <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(up to {MAX_FILES}, max 5 MB each)</span></label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1.5px dashed var(--border)", borderRadius: "var(--radius-sm)", cursor: imageFiles.length >= MAX_FILES ? "not-allowed" : "pointer", background: "var(--bg)", fontSize: 13, color: "var(--text-secondary)", opacity: imageFiles.length >= MAX_FILES ? 0.5 : 1 }}>
                <Upload size={16} />
                {imageFiles.length === 0 ? "Click to upload images" : `${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""} selected — click to add more`}
                <input type="file" accept="image/*" multiple style={{ display: "none" }} disabled={imageFiles.length >= MAX_FILES} onChange={handleFileSelect} />
              </label>

              {previews.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8, marginTop: 10 }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={src} alt={`preview-${i}`} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, border: i === 0 ? "2px solid var(--primary)" : "1px solid var(--border)" }} />
                      {i === 0 && <span style={{ position: "absolute", top: 4, left: 4, background: "var(--primary)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>Main</span>}
                      <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, background: "#ef4444", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                        <X size={11} color="#fff" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea name="description" placeholder="Describe the product..." onChange={handleChange} />
            </div>
            <button type="submit" className="form-submit-btn" disabled={saving}>{saving ? "Saving..." : "Create Product"}</button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateProduct;
