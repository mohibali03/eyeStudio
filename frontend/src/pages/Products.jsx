import { useState } from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const allProducts = [
  { id: 1, name: "Classic Round Frame", price: 1999, category: "Men" },
  { id: 2, name: "Modern Square Frame", price: 2499, category: "Women" },
  { id: 3, name: "Kids Comfort Frame", price: 1299, category: "Kids" },
  { id: 4, name: "Premium Blue Cut Frame", price: 3499, category: "Unisex" },
];

const Products = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState("All");

  // Handle checkbox
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Filter logic
  const filteredProducts = allProducts.filter((product) => {
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    let priceMatch = true;
    if (priceRange === "under1500") priceMatch = product.price < 1500;
    if (priceRange === "1500to3000")
      priceMatch = product.price >= 1500 && product.price <= 3000;
    if (priceRange === "above3000") priceMatch = product.price > 3000;

    return categoryMatch && priceMatch;
  });

  return (
    <>
      <Header />

      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Filters */}
          <aside>
            <h3 className="text-xl font-semibold mb-6">Filters</h3>

            {/* Category */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Category</h4>
              {["Men", "Women", "Kids", "Unisex"].map((cat) => (
                <label key={cat} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    onChange={() => handleCategoryChange(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>

            {/* Price */}
            <div>
              <h4 className="font-medium mb-3">Price Range</h4>
              <select
                className="w-full border rounded-lg px-3 py-2"
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="All">All</option>
                <option value="under1500">Under ₹1500</option>
                <option value="1500to3000">₹1500 - ₹3000</option>
                <option value="above3000">Above ₹3000</option>
              </select>
            </div>
          </aside>

          {/* Products */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-2xl p-5 hover:shadow-lg transition"
                >
                  <div className="h-40 bg-light rounded-xl flex items-center justify-center text-primary">
                    Frame Image
                  </div>

                  <h3 className="mt-4 font-semibold">{product.name}</h3>
                  <p className="text-gray-500">{product.category}</p>
                  <p className="mt-2 text-primary font-bold">
                    ₹{product.price}
                  </p>

                  <Link
                    to={`/products/${product.id}`}
                    className="mt-4 block text-center bg-primary text-white py-2 rounded-full"
                  >
                    View Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Products;
