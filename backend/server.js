import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";

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

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zestyflow")
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`✅ Server running on http://127.0.0.1:${port}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));
