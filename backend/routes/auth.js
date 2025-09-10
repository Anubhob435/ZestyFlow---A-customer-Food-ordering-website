import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-development";

// Helper: create JWT
function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
}

// Signup
router.post("/signup", async (req, res) => {
  try {
    console.log("Signup attempt:", { body: req.body });
    
    const { name, email, phone, location, locationType, password, age } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "Name, email, phone, and password are required" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({ 
      name, 
      email, 
      phone, 
      location, 
      locationType: locationType || "home", 
      passwordHash: hashedPassword, 
      age: age ? parseInt(age) : undefined
    });
    
    console.log("Attempting to save user:", { email, name });
    await user.save();
    console.log("User saved successfully");

    const token = generateToken(user);

    res.json({
      message: "Signup successful",
      token,
      user: { id: user._id, name, email, phone, location, locationType, age }
    });
  } catch (err) {
    console.error("Signup error:", err);
    console.error("Error stack:", err.stack);
    
    // More specific error messages
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid input data", details: err.message });
    }
    
    res.status(500).json({ message: "Server error during signup", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email, phone: user.phone, location: user.location, locationType: user.locationType, age: user.age }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get logged-in user
router.get("/me", async (req, res) => {
  try {
    console.log("Get user info request");
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No authorization header");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("No token in header");
      return res.status(401).json({ message: "Invalid token format" });
    }

    console.log("Verifying token...");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified, user ID:", decoded.id);
    
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      console.log("User not found for ID:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.email);
    res.json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Authentication failed" });
  }
});

export default router;
