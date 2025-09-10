import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Order from "../models/Order.js";

const router = express.Router();

// Place order
router.post("/", requireAuth, async (req, res) => {
  try {
    console.log("Order placement request:", {
      user: req.user,
      body: req.body
    });

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      console.log("Invalid items array:", items);
      return res.status(400).json({ message: "No items provided or invalid format" });
    }

    // Validate and sanitize items
    const orderItems = items.map((i, index) => {
      console.log(`Processing item ${index}:`, i);
      
      if (!i.name || typeof i.name !== 'string') {
        throw new Error(`Item ${index}: Missing or invalid name`);
      }
      if (!i.price || isNaN(Number(i.price))) {
        throw new Error(`Item ${index}: Missing or invalid price`);
      }
      if (!i.quantity || isNaN(Number(i.quantity))) {
        throw new Error(`Item ${index}: Missing or invalid quantity`);
      }

      return {
        name: i.name.trim(),
        price: Number(i.price),
        quantity: Math.max(1, parseInt(i.quantity, 10))
      };
    });

    console.log("Processed order items:", orderItems);

    const total = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    console.log("Calculated total:", total);

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      status: "placed"
    });

    console.log("Order created successfully:", order._id);

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
      total,
      createdAt: order.createdAt
    });
  } catch (err) {
    console.error("Order place error:", err);
    console.error("Error stack:", err.stack);
    
    if (err.message.includes('Item')) {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ 
      message: "Server error while placing order",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get my orders
router.get("/me", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel order
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (order.status !== "placed") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    // Check 2-minute window
    const placedTime = new Date(order.createdAt).getTime();
    if (Date.now() - placedTime > 2 * 60 * 1000) {
      return res.status(400).json({ message: "Time limit exceeded to cancel order" });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
