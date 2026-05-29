import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ── Password validation (mirrors frontend rules) ── */
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,20}$/;
const PW_MESSAGE = "Password must be 8–20 characters and include uppercase, lowercase, number, and special character.";

const PHONE_REGEX = /^[0-9]{10}$/;
const PHONE_MESSAGE = "Phone number must be exactly 10 digits.";

// GET ALL CUSTOMERS (ADMIN ONLY) — with server-side pagination
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip     = (page - 1) * limit;
    const search   = req.query.search || "";

    const filter = { role: "customer" };
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      customers:   users,
      totalCount,
      totalPages:  Math.ceil(totalCount / limit),
      currentPage: page,
      pageSize:    limit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add customer
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!PW_REGEX.test(password)) return res.status(400).json({ message: PW_MESSAGE });
    if (phone && !PHONE_REGEX.test(phone)) return res.status(400).json({ message: PHONE_MESSAGE });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone: phone || "", role: "customer" });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, phone: user.phone });
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
    const { name, email, password, phone } = req.body;
    if (password) {
      if (!PW_REGEX.test(password)) return res.status(400).json({ message: PW_MESSAGE });
    }
    if (phone && !PHONE_REGEX.test(phone)) return res.status(400).json({ message: PHONE_MESSAGE });
    const updates = { name, email };
    if (phone !== undefined) updates.phone = phone;
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
