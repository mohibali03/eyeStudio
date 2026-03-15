import express from "express";
import Prescription from "../models/Prescription.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// IMPORTANT: /my and /customer/:id must come BEFORE /:customerId
// otherwise Express matches "my" and "customer" as a customerId param

// Get logged-in customer's own prescriptions (all, newest first)
router.get("/my", protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
});

// Get all prescriptions for a customer (admin only)
router.get("/customer/:id", protect, adminOnly, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ customer: req.params.id }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
});

// Add prescription for customer (admin only)
router.post("/:customerId", protect, adminOnly, async (req, res) => {
  try {
    const prescription = await Prescription.create({
      customer: req.params.customerId,
      ...req.body,
    });
    res.status(201).json({ message: "Prescription saved", prescription });
  } catch (err) {
    res.status(500).json({ message: "Failed to save prescription" });
  }
});

export default router;
