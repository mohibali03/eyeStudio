import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Admin stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalProducts = await Product.countDocuments();
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;

    // Monthly sales (last 6 months)
    const now = new Date();
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthOrders = orders.filter((o) => new Date(o.createdAt) >= d && new Date(o.createdAt) < end);
      monthlySales.push({
        month: d.toLocaleString("default", { month: "short" }),
        sales: monthOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
        orders: monthOrders.length,
      });
    }

    res.json({ totalCustomers, totalProducts, totalOrders, totalSales, pending, completed, cancelled, monthlySales });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get my orders (customer)
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get all orders (admin) - no limit, full list
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email phone")
      .populate("prescription")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get all orders (admin) - dashboard preview
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate("customer", "name email").sort({ createdAt: -1 }).limit(10);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Update order status (admin)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("customer", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Create order for customer
router.post("/:customerId", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.create({
      customer: req.params.customerId,
      ...req.body,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to create order" });
  }
});

// 🔹 Get orders of a customer (Admin)
router.get("/customer/:customerId", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.customerId })
      .populate("prescription");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
