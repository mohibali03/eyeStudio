import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";
import { Tag, Layers, ArrowLeft, CalendarCheck, Glasses } from "lucide-react";
import "../styles/productdetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products/${id}`)
      .then(r => r.json())
      .then(d => { setProduct(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Header />
      <div className="loading" style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-secondary)"}}>Loading...</div>
      <Footer />
    </>
  );

  if (!product) return (
    <>
      <Header />
      <div className="not-found" style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
        <Glasses size={48} style={{opacity:.3}} />
        <h2 style={{fontSize:22,color:"var(--text-secondary)"}}>Product not found</h2>
        <Link to="/products" className="back-btn" style={{display:"inline-block",padding:"10px 20px"}}>Back to Products</Link>
      </div>
      <Footer />
    </>
  );

  const imgSrc = product.imageUrl
    ? (product.imageUrl.startsWith("http") ? product.imageUrl : `http://localhost:5000${product.imageUrl}`)
    : null;

  return (
    <>
      <Header />
      <div className="product-details-page">
        <div className="product-details-wrapper">
          <div className="product-details-image">
            {imgSrc
              ? <img src={imgSrc} alt={product.name} />
              : <div className="placeholder-large"><Glasses size={80} /></div>
            }
          </div>

          <div className="product-details-info">
            <div className="product-details-badge"><Tag size={12} /> {product.category}</div>
            <h1>{product.name}</h1>

            <div className="product-meta">
              {product.frameType && <span><strong>Frame Type:</strong> {product.frameType}</span>}
              <span style={{display:"flex",alignItems:"center",gap:6}}><Layers size={13} /> {product.category} Collection</span>
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
                <CalendarCheck size={15} style={{display:"inline",verticalAlign:"middle",marginRight:6}} />
                Book Eye Test
              </Link>
              <Link to="/products" className="back-btn">
                <ArrowLeft size={15} style={{display:"inline",verticalAlign:"middle",marginRight:6}} />
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
