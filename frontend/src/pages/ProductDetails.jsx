import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";

const products = [
  {
    id: "1",
    name: "Classic Round Frame",
    price: 1999,
    category: "Men",
    description:
      "A timeless round frame made with lightweight material for all-day comfort.",
  },
  {
    id: "2",
    name: "Modern Square Frame",
    price: 2499,
    category: "Women",
    description:
      "Stylish square frame with a modern look, perfect for office and casual wear.",
  },
  {
    id: "3",
    name: "Kids Comfort Frame",
    price: 1299,
    category: "Kids",
    description:
      "Durable and comfortable frame designed specially for kids.",
  },
  {
    id: "4",
    name: "Premium Blue Cut Frame",
    price: 3499,
    category: "Unisex",
    description:
      "Premium frame with blue-cut lenses for digital screen protection.",
  },
];

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return <p className="p-10">Product not found</p>;
  }

  return (
    <>
      <Header />

      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Image */}
        <div className="bg-light rounded-3xl h-96 flex items-center justify-center text-primary font-semibold">
          Product Image
        </div>

        {/* Details */}
        <div>
          <h1 className="text-4xl font-bold text-primary">
            {product.name}
          </h1>

          <p className="mt-2 text-gray-500">
            Category: {product.category}
          </p>

          <p className="mt-4 text-2xl font-semibold text-gray-800">
            ₹{product.price}
          </p>

          <p className="mt-6 text-gray-600">
            {product.description}
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/book-test"
              className="bg-primary text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
            >
              Book Eye Test
            </Link>

            <Link
              to="/products"
              className="border border-primary text-primary px-6 py-3 rounded-full hover:bg-primary hover:text-white transition"
            >
              Back to Products
            </Link>
          </div>
        </div>

      </section>
    </>
  );
};

export default ProductDetails;
