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
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/CustomerProfile";
import EditProfile from "./pages/customer/EditProfile";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerPrescriptions from "./pages/customer/CustomerPrescriptions";
import CreateOrder from "./pages/admin/CreateOrder";
import CreateProduct from "./pages/admin/CreateProduct";
import CreateCustomer from "./pages/admin/CreateCustomer";
import EyeTestBookings from "./pages/admin/EyeTestBookings";
import ManageCustomers from "./pages/admin/ManageCustomers";
import ManageProducts from "./pages/admin/ManageProducts";
import AdminProfile from "./pages/admin/AdminProfile";
import ManageOrders from "./pages/admin/ManageOrders";

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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <CustomerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute>
              <CustomerPrescriptions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders/create/:customerId"
          element={
            <AdminRoute>
              <CreateOrder />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products/create"
          element={
            <AdminRoute>
              <CreateProduct />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/customers/create"
          element={
            <AdminRoute>
              <CreateCustomer />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/eye-test-bookings"
          element={
            <AdminRoute>
              <EyeTestBookings />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/manage-customers"
          element={
            <AdminRoute>
              <ManageCustomers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminProfile />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <ManageOrders />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/manage-products"
          element={
            <AdminRoute>
              <ManageProducts />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
