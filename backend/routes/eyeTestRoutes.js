import express from "express";
import EyeTest from "../models/EyeTest.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Book eye test (public)
router.post("/", async (req, res) => {
  try {
    const booking = await EyeTest.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to book eye test" });
  }
});

// Get all bookings (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const bookings = await EyeTest.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Update booking status (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const booking = await EyeTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to update booking" });
  }
});

export default router;
