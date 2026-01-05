import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

// ✅ 1. Create app FIRST
const app = express();

// ✅ 2. Middleware
app.use(cors());
app.use(express.json());

// ✅ 3. Connect DB
connectDB();

// ✅ 4. Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// ✅ 5. Test route
app.get("/", (req, res) => {
  res.send("eyeStudio backend is running");
});

// ✅ 6. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
