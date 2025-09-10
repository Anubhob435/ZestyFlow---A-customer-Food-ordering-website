import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-development";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);
    
    if (!authHeader) {
      console.log("No authorization header");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("No token in authorization header");
      return res.status(401).json({ message: "Invalid token format" });
    }

    console.log("Attempting to verify token with secret:", JWT_SECRET ? "Set" : "Not set");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token decoded successfully:", decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found for ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    console.log("User authenticated:", { id: user._id, email: user.email });
    req.user = { id: user._id, email: user.email };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Authentication failed" });
  }
};
