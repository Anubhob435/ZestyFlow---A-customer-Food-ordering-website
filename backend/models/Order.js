import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "preparing", "on-the-way", "delivered", "cancelled"],
      default: "placed"
    }
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt
);

export default mongoose.model("Order", orderSchema);
