import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL CUSTOMERS (ADMIN ONLY)
router.get("/", protect, adminOnly, async (req, res) => {
  const users = await User.find({ role: "customer" }).select("-password");
  res.json(users);
});

export default router;
