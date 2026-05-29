import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // 1. Try HTTP-only cookie first
    let token = req.cookies?.token;
    let source = "cookie";

    // 2. Fall back to Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        source = "header";
      }
    }

    if (!token) {
      console.warn(`[AUTH] 401 - No token | ${req.method} ${req.originalUrl} | origin: ${req.headers.origin || "none"} | cookies: ${JSON.stringify(req.cookies)}`);
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.warn(`[AUTH] 401 - User not found for id: ${decoded.id}`);
      return res.status(401).json({ message: "User not found" });
    }

    console.log(`[AUTH] OK - ${req.user.email} (${req.user.role}) via ${source} | ${req.method} ${req.originalUrl}`);
    next();
  } catch (err) {
    console.warn(`[AUTH] 401 - Token error: ${err.message} | ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    console.warn(`[AUTH] 403 - Admin required, got role: ${req.user?.role} | ${req.method} ${req.originalUrl}`);
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
