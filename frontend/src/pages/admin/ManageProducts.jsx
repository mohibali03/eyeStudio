import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { authFetch } from "../../context/AuthContext";
import { X, Upload } from "lucide-react";
import "../../styles/newDashboard.css";
import "../../styles/admin.css";
import "../../styles/managepage.css";

const MAX_FILES = 6;
const MAX_SIZE  = 5 * 1024 * 1024;
const ALLOWED   = ["image/jpeg", "image/png", "image/webp"];

const FRAME_SHAPES = ["Round","Square","Rectangle","Cat Eye","Aviator","Wayfarer","Geometric","Oval","Hexagonal"];
const FRAME_COLORS = ["Black","Blue","Brown","Silver","Gold","Transparent","Red","Green","Pink","White"];
const MATERIALS    = ["Metal","Plastic","Titanium","Acetate","TR90","Wood"];
const TRUST_OPTS   = ["Free Shipping","1 Year Warranty","Easy Return","COD Available","Premium Quality","UV Protection","Anti-Glare","Blue Light Block","Scratch Resistant"];

const EMPTY_FORM = {
  name:"", price:"", category:"Men", brand:"",
  frameType:"", frameShape:"", frameSize:"", material:"", weight:"",
  frameColor:[], faceShape:[], occasion:[], clothesMatcher:[],
  looksFinder:[], vibeCheck:[], countryOfOrigin:"",
  computerGlasses:false, description:"", imageUrl:"", images:[],
  trustBadges:[],
};

// Inline chip toggle for the edit form
const InlineChips = ({ label, options, value, multi, formKey, onChange }) => (
  <div className="form-field">
    <label style={{fontSize:12}}>{label}</label>
    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:2}}>
      {options.map(opt => {
        const active = multi ? (value||[]).includes(opt) : value === opt;
        return (
          <button
            key={opt} type="button"
            style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${active?"var(--primary)":"var(--border)"}`,background:active?"var(--primary)":"var(--bg)",color:active?"#fff":"var(--text-secondary)",transition:"all .15s"}}
            onClick={() => {
              if (multi) {
                const cur = value || [];
                onChange(formKey, cur.includes(opt) ? cur.filter(v=>v!==opt) : [...cur, opt]);
              } else {
                onChange(formKey, value === opt ? "" : opt);
              }
            }}
          >{opt}</button>
        );
      })}
    </div>
  </div>
);

const ManageProducts = () => {
  const [products, setProducts]   = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews]     = useState([]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchProducts = () => {
    fetch(`${API_BASE_URL}/products`)
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .catch(() => showToast("Failed to load products", "error"));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFieldChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageSelect = (e) => {
    const selected = Array.from(e.target.files);
    const valid = [];
    for (const f of selected) {
      if (!ALLOWED.includes(f.type)) { showToast(`${f.name}: unsupported format`, "error"); continue; }
      if (f.size > MAX_SIZE)         { showToast(`${f.name}: exceeds 5 MB`, "error"); continue; }
      valid.push(f);
    }
    const combined = [...imageFiles, ...valid].slice(0, MAX_FILES);
    setImageFiles(combined);
    setPreviews(combined.map(f => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removePreview = (idx) => {
    const files = imageFiles.filter((_, i) => i !== idx);
    if (files.length === 0 && form.images.length > 0) {
      setPreviews(form.images);
    } else {
      setImageFiles(files);
      setPreviews(files.map(f => URL.createObjectURL(f)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let images = form.images || [];

    if (imageFiles.length > 0) {
      const fd = new FormData();
      imageFiles.forEach(f => fd.append("images", f));
      const uploadRes = await authFetch(`${API_BASE_URL}/products/upload-multiple`, { method:"POST", body:fd });
      if (!uploadRes.ok) { showToast("Image upload failed", "error"); return; }
      images = (await uploadRes.json()).imageUrls;
    }

    const method = editingId ? "PUT" : "POST";
    const url    = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;

    const res = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, imageUrl: images[0] || form.imageUrl || "", images, price: Number(form.price) }),
    });

    if (res.ok) {
      setShowForm(false); setEditingId(null);
      setForm(EMPTY_FORM); setImageFiles([]); setPreviews([]);
      fetchProducts();
      showToast(editingId ? "Product updated" : "Product created");
    } else {
      showToast("Failed to save product", "error");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name, price: p.price, category: p.category,
      brand: p.brand||"", frameType: p.frameType||"", frameShape: p.frameShape||"",
      frameSize: p.frameSize||"", material: p.material||"", weight: p.weight||"",
      frameColor: p.frameColor||[], faceShape: p.faceShape||[],
      occasion: p.occasion||[], clothesMatcher: p.clothesMatcher||[],
      looksFinder: p.looksFinder||[], vibeCheck: p.vibeCheck||[],
      countryOfOrigin: p.countryOfOrigin||"",
      computerGlasses: p.computerGlasses||false,
      description: p.description||"",
      imageUrl: p.imageUrl||"", images: p.images||[],
      trustBadges: p.trustBadges||[],
    });
    setImageFiles([]);
    setPreviews(p.images?.length ? p.images : (p.imageUrl ? [p.imageUrl] : []));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const res = await authFetch(`${API_BASE_URL}/products/${id}`, { method:"DELETE" });
    if (res.ok) { fetchProducts(); showToast("Product deleted"); }
    else showToast("Failed to delete product", "error");
  };

  const handleCancel = () => {
    setShowForm(false); setEditingId(null);
    setForm(EMPTY_FORM); setImageFiles([]); setPreviews([]);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout active="products" title="Products" subtitle="Manage your eyewear inventory">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="ds-content">
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button className="save-btn" onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setImageFiles([]); setPreviews([]); }}>
            + Add Product
          </button>
        </div>

        {showForm && (
          <div className="manage-form-card">
            <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
            <form onSubmit={handleSubmit} className="manage-form">
              <div className="form-row">

                {/* Basic */}
                <div className="form-field"><label>Product Name</label><input name="name" value={form.name} onChange={handleChange} placeholder="Product name" required /></div>
                <div className="form-field"><label>Price (₹)</label><input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required /></div>
                <div className="form-field"><label>Brand</label><input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Ray-Ban" /></div>
                <div className="form-field">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    {["Men","Women","Kids","Unisex"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Frame attributes */}
                <InlineChips label="Frame Type"  options={["Full Rim","Half Rim","Rimless"]}       value={form.frameType}  multi={false} formKey="frameType"  onChange={handleFieldChange} />
                <InlineChips label="Frame Shape" options={FRAME_SHAPES}                            value={form.frameShape} multi={false} formKey="frameShape" onChange={handleFieldChange} />
                <InlineChips label="Frame Size"  options={["Small","Medium","Large"]}              value={form.frameSize}  multi={false} formKey="frameSize"  onChange={handleFieldChange} />
                <InlineChips label="Material"    options={MATERIALS}                               value={form.material}   multi={false} formKey="material"   onChange={handleFieldChange} />
                <InlineChips label="Weight"      options={["Lightweight","Medium","Heavy"]}        value={form.weight}     multi={false} formKey="weight"     onChange={handleFieldChange} />
                <InlineChips label="Frame Color (multi)" options={FRAME_COLORS}                   value={form.frameColor} multi={true}  formKey="frameColor" onChange={handleFieldChange} />
                <InlineChips label="Trust Badges (multi)" options={TRUST_OPTS}                    value={form.trustBadges} multi={true} formKey="trustBadges" onChange={handleFieldChange} />

                {/* Images — "Main" label removed, first image just has a blue border */}
                <div className="form-field">
                  <label>Product Images ({previews.length}/{MAX_FILES})</label>
                  <label style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",border:"1.5px dashed var(--border)",borderRadius:6,cursor:imageFiles.length>=MAX_FILES?"not-allowed":"pointer",fontSize:13,color:"var(--text-secondary)",opacity:imageFiles.length>=MAX_FILES?0.5:1}}>
                    <Upload size={14}/> Click to add images
                    <input type="file" accept="image/*" multiple style={{display:"none"}} disabled={imageFiles.length>=MAX_FILES} onChange={handleImageSelect}/>
                  </label>
                  {previews.length > 0 && (
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(72px,1fr))",gap:6,marginTop:8}}>
                      {previews.map((src,i) => (
                        <div key={i} style={{position:"relative"}}>
                          {/* ✅ No "Main" label — first image indicated only by blue border */}
                          <img src={src} alt={`img-${i}`} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:6,border:i===0?"2px solid var(--primary)":"1px solid var(--border)"}}/>
                          <button type="button" onClick={()=>removePreview(i)} style={{position:"absolute",top:2,right:2,background:"#ef4444",border:"none",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}>
                            <X size={9} color="#fff"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-field form-field-full">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Product description" rows={3}/>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">{editingId ? "Update" : "Create"}</button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="manage-search">
          <input type="text" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Image</th><th>Name</th><th>Brand</th><th>Category</th><th>Shape</th><th>Price</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td>
                    {(product.images?.[0] || product.imageUrl)
                      ? <img src={(product.images?.[0] || product.imageUrl).startsWith("http") ? (product.images?.[0] || product.imageUrl) : `http://localhost:5000${product.images?.[0] || product.imageUrl}`} alt={product.name} className="table-img" />
                      : <div className="table-img-placeholder">🕶️</div>
                    }
                  </td>
                  <td>{product.name}</td>
                  <td style={{color:"var(--text-secondary)",fontSize:13}}>{product.brand||"—"}</td>
                  <td><span className="category-badge">{product.category}</span></td>
                  <td style={{fontSize:13}}>{product.frameShape||"—"}</td>
                  <td className="price-cell">₹{product.price.toLocaleString()}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => handleEdit(product)}>✏️ Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(product._id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="no-data">No products found</p>}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageProducts;
