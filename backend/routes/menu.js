import express from "express";
import MenuItem from "../models/MenuItem.js";

const router = express.Router();

// get all available menu items
router.get("/", async (_req, res) => {
  const items = await MenuItem.find({ available: true }).sort({ createdAt: -1 });
  res.json(items);
});

// add new menu item
router.post("/", async (req, res) => {
  const { name, price, imageUrl, description, category, available } = req.body;
  if (!name || price == null) return res.status(400).json({ message: "name and price required" });
  const item = await MenuItem.create({ name, price, imageUrl, description, category, available });
  res.status(201).json(item);
});

export default router;
