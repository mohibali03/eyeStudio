import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { X, Upload } from "lucide-react";
import "../../styles/newDashboard.css";
import "../../styles/admin.css";
import "../../styles/managepage.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const [form, setForm] = useState({
    name: "", price: "", category: "Men", frameType: "", description: "", imageUrl: "", images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews]     = useState([]);

  const MAX_FILES = 6;
  const MAX_SIZE  = 5 * 1024 * 1024;
  const ALLOWED   = ["image/jpeg", "image/png", "image/webp"];

  const fetchProducts = () => {
    fetch(`${API_BASE_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => showToast("Failed to load products", "error"));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removePreview = (idx) => {
    const files = imageFiles.filter((_, i) => i !== idx);
    // if no new files left, keep existing URLs
    if (files.length === 0 && form.images.length > 0) {
      setPreviews(form.images);
    } else {
      setImageFiles(files);
      setPreviews(files.map((f) => URL.createObjectURL(f)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let images = form.images || [];

    if (imageFiles.length > 0) {
      const fd = new FormData();
      imageFiles.forEach((f) => fd.append("images", f));
      const uploadRes = await fetch(`${API_BASE_URL}/products/upload-multiple`, {
        method: "POST", credentials: "include", body: fd,
      });
      if (!uploadRes.ok) { showToast("Image upload failed", "error"); return; }
      const uploadData = await uploadRes.json();
      images = uploadData.imageUrls;
    }
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, imageUrl: images[0] || form.imageUrl || "", images, price: Number(form.price) }),
    });

    if (res.ok) {
      setShowForm(false); setEditingId(null);
      setForm({ name: "", price: "", category: "Men", frameType: "", description: "", imageUrl: "", images: [] });
      setImageFiles([]); setPreviews([]);
      fetchProducts();
      showToast(editingId ? "Product updated successfully" : "Product created successfully");
    } else {
      showToast("Failed to save product", "error");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name, price: product.price, category: product.category,
      frameType: product.frameType || "", description: product.description || "",
      imageUrl: product.imageUrl || "", images: product.images || [],
    });
    setImageFiles([]);
    setPreviews(product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : []));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE", credentials: "include",
    });
    if (res.ok) { fetchProducts(); showToast("Product deleted"); }
    else showToast("Failed to delete product", "error");
  };

  const handleCancel = () => {
    setShowForm(false); setEditingId(null);
    setForm({ name: "", price: "", category: "Men", frameType: "", description: "", imageUrl: "", images: [] });
    setImageFiles([]); setPreviews([]);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout active="products" title="Products" subtitle="Manage your eyewear inventory">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="ds-content">

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="save-btn"
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", price: "", category: "Men", frameType: "", description: "", imageUrl: "" }); setImageFile(null); setImagePreview(""); }}
            >
              + Add Product
            </button>
          </div>

          {showForm && (
            <div className="manage-form-card">
              <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
              <form onSubmit={handleSubmit} className="manage-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Product Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Enter product name" required />
                  </div>
                  <div className="form-field">
                    <label>Price (₹)</label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Enter price" required />
                  </div>
                  <div className="form-field">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Frame Type</label>
                    <input name="frameType" value={form.frameType} onChange={handleChange} placeholder="e.g. Round, Square" />
                  </div>
                  <div className="form-field">
                    <label>Product Images <span style={{fontWeight:400,fontSize:12,color:"var(--text-secondary)"}}>({previews.length}/{MAX_FILES})</span></label>
                    <label style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",border:"1.5px dashed var(--border)",borderRadius:6,cursor:imageFiles.length>=MAX_FILES?"not-allowed":"pointer",fontSize:13,color:"var(--text-secondary)",opacity:imageFiles.length>=MAX_FILES?0.5:1}}>
                      <Upload size={14}/> Click to add images
                      <input type="file" accept="image/*" multiple style={{display:"none"}} disabled={imageFiles.length>=MAX_FILES} onChange={handleImageSelect}/>
                    </label>
                    {previews.length > 0 && (
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(72px,1fr))",gap:6,marginTop:8}}>
                        {previews.map((src,i) => (
                          <div key={i} style={{position:"relative"}}>
                            <img src={src} alt={`img-${i}`} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:6,border:i===0?"2px solid var(--primary)":"1px solid var(--border)"}}/>
                            {i===0 && <span style={{position:"absolute",top:2,left:2,background:"var(--primary)",color:"#fff",fontSize:9,padding:"1px 4px",borderRadius:3}}>Main</span>}
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
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter product description" rows={3} />
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
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Frame Type</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, index) => (
                  <tr key={product._id}>
                    <td>{index + 1}</td>
                    <td>
                      {product.imageUrl ? (
                        <img src={product.imageUrl.startsWith("http") ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} alt={product.name} className="table-img" />
                      ) : (
                        <div className="table-img-placeholder">🕶️</div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td><span className="category-badge">{product.category}</span></td>
                    <td>{product.frameType || "—"}</td>
                    <td className="price-cell">₹{product.price}</td>
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
            {filtered.length === 0 && (
              <p className="no-data">No products found</p>
            )}
          </div>
        </div>
      </AdminLayout>
    );
};

export default ManageProducts;
