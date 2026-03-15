import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import eyeTestRoutes from "./routes/eyeTestRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 1. Create app FIRST
const app = express();

// ✅ 2. Middleware
app.use(cors({
  origin: process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(u => u.trim())
    : true,
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 3. Connect DB
connectDB();

// ✅ 4. Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/eye-tests", eyeTestRoutes);

// ✅ 5. Test routes
app.get("/", (req, res) => {
  res.send("eyeStudio backend is running");
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongo: process.env.MONGO_URI ? "set" : "MISSING",
    jwt:   process.env.JWT_SECRET ? "set" : "MISSING",
    cors:  process.env.CLIENT_URL || "open (CLIENT_URL not set)",
  });
});

// ✅ 6. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
