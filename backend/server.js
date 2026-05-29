import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import eyeTestRoutes from "./routes/eyeTestRoutes.js";

dotenv.config();

// ── Startup env validation ────────────────────────────────────────────────────
if (!process.env.JWT_SECRET)  console.error("[FATAL] JWT_SECRET is not set");
if (!process.env.MONGO_URI)   console.error("[FATAL] MONGO_URI is not set");
if (!process.env.CLIENT_URL)  console.warn("[WARN]  CLIENT_URL is not set — CORS will only allow localhost:5173");
if (!process.env.NODE_ENV)    console.warn("[WARN]  NODE_ENV is not set — cookies will use insecure settings");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((u) => u.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin} | Allowed: ${allowedOrigins.join(", ")}`);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Session middleware ────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
  },
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/eye-tests", eyeTestRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("eyeStudio backend is running"));
app.get("/api/health", (req, res) => {
  res.json({
    status:         "ok",
    nodeEnv:        process.env.NODE_ENV        || "NOT SET ⚠️",
    mongo:          process.env.MONGO_URI       ? "set ✅" : "MISSING ❌",
    jwt:            process.env.JWT_SECRET      ? "set ✅" : "MISSING ❌",
    sessionSecret:  process.env.SESSION_SECRET  ? "set ✅" : "using JWT_SECRET fallback ⚠️",
    clientUrl:      process.env.CLIENT_URL      || "NOT SET ⚠️ — defaulting to localhost:5173",
    allowedOrigins,
    requestOrigin:  req.headers.origin          || "(no origin header — same-origin or Postman)",
    cookieReceived: req.cookies?.token          ? "yes ✅" : "no ❌",
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
