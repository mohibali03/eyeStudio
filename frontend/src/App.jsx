import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import LensGuide from "./pages/LensGuide";
import BookTest from "./pages/BookTest";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Prescription from "./pages/admin/Prescription";
import CustomerList from "./pages/admin/CustomerList";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/lens-guide" element={<LensGuide />} />
        <Route path="/book-test" element={<BookTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 Protected User Routes */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        {/* 🔐 ADMIN ROUTES (SECURED) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <AdminRoute>
              <CustomerList />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/prescription/add/:customerId"
          element={
            <AdminRoute>
              <Prescription />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
