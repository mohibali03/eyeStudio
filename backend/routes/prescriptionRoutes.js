import express from "express";
import Prescription from "../models/Prescription.js";

const router = express.Router();

// Add prescription for customer
router.post("/:customerId", async (req, res) => {
  try {
    const prescription = new Prescription({
      customer: req.params.customerId,
      ...req.body,
    });

    await prescription.save();

    res.status(201).json({
      message: "Prescription saved",
      prescription,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save prescription" });
  }
});

export default router; // ✅ THIS WAS MISSING
