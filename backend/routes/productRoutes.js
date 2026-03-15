import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Parse CLOUDINARY_URL manually (required in Node.js ESM environment)
if (process.env.CLOUDINARY_URL) {
  const url = new URL(process.env.CLOUDINARY_URL);
  cloudinary.config({
    cloud_name: url.host,
    api_key: url.username,
    api_secret: url.password,
  });
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "eyestudio", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
});
const upload = multer({ storage });

// Upload image
router.post("/upload", protect, adminOnly, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({ message: "Image upload failed", error: err.message });
    }
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ imageUrl: req.file.path });
  });
});

// Get all products (public)
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// Create product (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to create product" });
  }
});

// Update product (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

// Delete product (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

export default router;
