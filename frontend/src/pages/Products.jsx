import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { SlidersHorizontal, Glasses, ArrowRight } from "lucide-react";
import "../styles/products.css";

const Products = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(r => r.json())
      .then(setAllProducts)
      .catch(() => {});
  }, []);

  const toggleCategory = (cat) =>
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );

  const filtered = allProducts.filter(p => {
    const catOk = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    let priceOk = true;
    if (priceRange === "under1500")   priceOk = p.price < 1500;
    if (priceRange === "1500to3000")  priceOk = p.price >= 1500 && p.price <= 3000;
    if (priceRange === "above3000")   priceOk = p.price > 3000;
    return catOk && priceOk;
  });

  return (
    <>
      <Header />
      <div className="products-page">
        <div className="products-page-header">
          <h1>Eyewear Collection</h1>
          <p>{filtered.length} products found</p>
        </div>

        <div className="products-wrapper">
          <aside className="products-sidebar">
            <h3><SlidersHorizontal size={16} /> Filters</h3>

            <div className="filter-group">
              <h4>Category</h4>
              {["Men", "Women", "Kids", "Unisex"].map(cat => (
                <label key={cat}>
                  <input type="checkbox" onChange={() => toggleCategory(cat)} checked={selectedCategories.includes(cat)} />
                  {cat}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <select value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                <option value="All">All Prices</option>
                <option value="under1500">Under ₹1,500</option>
                <option value="1500to3000">₹1,500 – ₹3,000</option>
                <option value="above3000">Above ₹3,000</option>
              </select>
            </div>
          </aside>

          <div className="products-grid">
            {filtered.length === 0 ? (
              <div className="no-products">
                <Glasses size={48} style={{marginBottom:12,opacity:.3}} />
                <p>No products found matching your filters.</p>
              </div>
            ) : filtered.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {product.imageUrl
                    ? <img src={product.imageUrl.startsWith("http") ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} alt={product.name} />
                    : <div className="placeholder-image"><Glasses size={52} /></div>
                  }
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <span className="product-category">{product.category}</span>
                  <p className="product-price">₹{product.price.toLocaleString()}</p>
                  <Link to={`/products/${product._id}`} className="view-btn">
                    View Details <ArrowRight size={13} style={{display:"inline",verticalAlign:"middle",marginLeft:4}} />
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
