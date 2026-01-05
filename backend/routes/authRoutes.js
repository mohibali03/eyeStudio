import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

// ✅ YOU MUST CREATE ROUTER
const router = express.Router();

// ✅ ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ EXPORT DEFAULT
export default router;
