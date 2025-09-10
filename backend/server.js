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
  origin: process.env.CLIENT_ORIGIN || ["http://127.0.0.1:3000", "http://localhost:3000"],
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);

// Serve static files from the parent directory with proper headers
app.use(express.static(path.join(__dirname, ".."), {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

// Serve images with correct MIME types
app.use('/images', express.static(path.join(__dirname, '..', 'images'), {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    }
    if (path.endsWith('.avif')) {
      res.set('Content-Type', 'image/avif');
    }
  }
}));

// Root route - serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "home.html"));
});

// API health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString() });
});

// Serve specific HTML pages
app.get("/*.html", (req, res) => {
  const fileName = req.params[0] + '.html';
  const filePath = path.join(__dirname, "..", fileName);
  
  // Check if file exists
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).sendFile(path.join(__dirname, "..", "home.html"));
  }
});

// Catch-all route for API endpoints only
app.get("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Start server and connect to MongoDB
const port = process.env.PORT || 5000;

// Connect to MongoDB
console.log("Attempting to connect to MongoDB...");
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zestyflow")
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    console.log("Database URI:", process.env.MONGO_URI ? "Environment variable set" : "Using default local");
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("Full error:", err);
  });

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No (using fallback)'}`);
});
