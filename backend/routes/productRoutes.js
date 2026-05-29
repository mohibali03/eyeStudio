import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "eyestudio", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

// Upload single image
router.post("/upload", protect, adminOnly, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) return res.status(500).json({ message: "Image upload failed", error: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ imageUrl: req.file.path });
  });
});

// Upload multiple images (max 6)
router.post("/upload-multiple", protect, adminOnly, (req, res) => {
  upload.array("images", 6)(req, res, (err) => {
    if (err) return res.status(500).json({ message: "Upload failed", error: err.message });
    if (!req.files?.length) return res.status(400).json({ message: "No files uploaded" });
    res.json({ imageUrls: req.files.map((f) => f.path) });
  });
});

// Get all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
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
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
