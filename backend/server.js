import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import menuRoutes from "./routes/menu.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://127.0.0.1:3000",
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, "..")));

// Root route - serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "home.html"));
});

// API health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString() });
});

// Catch-all route for any other requests - serve the main page
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "home.html"));
});

// Start server first, then try to connect to MongoDB
const port = process.env.PORT || 5000;

// For Vercel deployment, we export the app instead of starting a server
if (process.env.NODE_ENV === 'production') {
  // Connect to MongoDB for production
  mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zestyflow")
    .then(() => {
      console.log("✅ Connected to MongoDB");
    })
    .catch(err => {
      console.warn("⚠️  MongoDB connection failed:", err.message);
    });
} else {
  // Local development server
  app.listen(port, () => {
    console.log(`✅ Server running on http://127.0.0.1:${port}`);
    
    // Try to connect to MongoDB
    mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zestyflow")
      .then(() => {
        console.log("✅ Connected to MongoDB");
      })
      .catch(err => {
        console.warn("⚠️  MongoDB connection failed:", err.message);
        console.log("📝 Server will continue running without database functionality");
      });
  });
}

// Export the app for Vercel
export default app;
