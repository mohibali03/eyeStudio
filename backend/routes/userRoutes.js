import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ── Password validation (mirrors frontend rules) ── */
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,20}$/;
const PW_MESSAGE = "Password must be 8–20 characters and include uppercase, lowercase, number, and special character.";

// GET ALL CUSTOMERS (ADMIN ONLY)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: "customer" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add customer
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!PW_REGEX.test(password)) return res.status(400).json({ message: PW_MESSAGE });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: "customer" });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET logged-in user profile
router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

// UPDATE logged-in user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (password) {
      if (!PW_REGEX.test(password)) return res.status(400).json({ message: PW_MESSAGE });
    }
    const updates = { name, email };
    if (password) updates.password = await bcrypt.hash(password, 10);
    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update customer
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete customer
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
