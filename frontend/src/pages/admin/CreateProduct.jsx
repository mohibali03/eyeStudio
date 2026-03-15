import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Toast from "../../components/Toast";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { Package, Upload } from "lucide-react";
import "../../styles/newDashboard.css";
import "../../styles/form.css";

const CreateProduct = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [product, setProduct] = useState({ name: "", price: "", category: "Men", frameType: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [toast, setToast] = useState(null);

  const handleChange = e => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = "";
    if (imageFile) {
      const fd = new FormData();
      fd.append("image", imageFile);
      const up = await fetch(`${API_BASE_URL}/products/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const upData = await up.json();
      if (!up.ok) { setToast({ message: upData.error || upData.message || "Image upload failed", type: "error" }); return; }
      imageUrl = upData.imageUrl;
    }
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...product, imageUrl, price: Number(product.price) }),
    });
    if (res.ok) {
      setToast({ message: "Product created successfully", type: "success" });
      setTimeout(() => navigate("/admin/manage-products"), 1500);
    } else {
      setToast({ message: "Failed to create product", type: "error" });
    }
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
        <div className="ds-table-card" style={{maxWidth:560}}>
          <div className="ds-table-header">
            <h3 style={{display:"flex",alignItems:"center",gap:8}}><Package size={16} color="var(--primary)" /> Product Details</h3>
          </div>
          <form onSubmit={handleSubmit} className="form-body">
            <div className="form-field">
              <label>Product Name</label>
              <input name="name" placeholder="e.g. Ray-Ban Aviator Classic" onChange={handleChange} required />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="form-field">
                <label>Price (₹)</label>
                <input name="price" type="number" placeholder="0" onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Category</label>
                <select name="category" onChange={handleChange}>
                  {["Men","Women","Kids","Unisex"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Frame Type</label>
              <input name="frameType" placeholder="e.g. Full Rim, Half Rim, Rimless" onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Product Image</label>
              <label style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",border:"1.5px dashed var(--border)",borderRadius:"var(--radius-sm)",cursor:"pointer",background:"var(--bg)",fontSize:13,color:"var(--text-secondary)"}}>
                <Upload size={16} />
                {imageFile ? imageFile.name : "Click to upload image"}
                <input type="file" accept="image/*" style={{display:"none"}} onChange={e => {
                  const f = e.target.files[0];
                  if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                }} />
              </label>
              {imagePreview && <img src={imagePreview} alt="preview" style={{width:120,height:90,objectFit:"cover",borderRadius:8,marginTop:8,border:"1px solid var(--border)"}} />}
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea name="description" placeholder="Describe the product..." onChange={handleChange} />
            </div>
            <button type="submit" className="form-submit-btn">Create Product</button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateProduct;
