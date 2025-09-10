import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  location: { type: String },
  locationType: { type: String, enum: ["home", "work", "other"], default: "home" },
  passwordHash: { type: String, required: true },
  age: { type: Number, min: 0 }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
