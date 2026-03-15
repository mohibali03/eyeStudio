import express from "express";
import Prescription from "../models/Prescription.js";
import { protect } from "../middleware/authMiddleware.js";

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

router.get("/my", protect, async (req, res) => {
  const prescription = await Prescription.findOne({
    customer: req.user.id,
  });
  res.json(prescription);
});
export default router;
