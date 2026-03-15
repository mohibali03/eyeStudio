import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/newDashboard.css";
import "../../styles/admin.css";
import "../../styles/managepage.css";

const ManageProducts = () => {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const [form, setForm] = useState({
    name: "", price: "", category: "Men", frameType: "", description: "", imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchProducts = () => {
    fetch(`${API_BASE_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => showToast("Failed to load products", "error"));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = form.imageUrl;

    if (imageFile) {
      const fd = new FormData();
      fd.append("image", imageFile);
      const uploadRes = await fetch(`${API_BASE_URL}/products/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!uploadRes.ok) { showToast("Image upload failed", "error"); return; }
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.imageUrl;
    }
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, imageUrl, price: Number(form.price) }),
    });

    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", price: "", category: "Men", frameType: "", description: "", imageUrl: "" });
      setImageFile(null);
      setImagePreview("");
      fetchProducts();
      showToast(editingId ? "Product updated successfully" : "Product created successfully");
    } else {
      showToast("Failed to save product", "error");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      frameType: product.frameType || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
    });
    setImageFile(null);
    setImagePreview(product.imageUrl || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { fetchProducts(); showToast("Product deleted"); }
    else showToast("Failed to delete product", "error");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", price: "", category: "Men", frameType: "", description: "", imageUrl: "" });
    setImageFile(null);
    setImagePreview("");
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
                    <label>Product Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && (
                      <img src={imagePreview.startsWith("blob") ? imagePreview : `http://localhost:5000${imagePreview}`} alt="preview" style={{ marginTop: 8, width: 100, height: 80, objectFit: "cover", borderRadius: 6 }} />
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
