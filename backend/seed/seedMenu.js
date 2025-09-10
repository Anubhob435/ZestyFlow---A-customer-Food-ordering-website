import "dotenv/config";
import { connectDB } from "../db.js";
import MenuItem from "../models/MenuItem.js";

const data = [
  { name: "Cheese Burst Pizza", price: 299, imageUrl: "images/cheeseBurst.jpeg", category: "Pizza", description: "Loaded cheese." },
  { name: "Loaded Burger", price: 199, imageUrl: "images/loadedBurger.jfif", category: "Burger", description: "Juicy burger." },
  { name: "Italian Pasta", price: 249, imageUrl: "images/italianPasta.webp", category: "Pasta", description: "Creamy pasta." },
  { name: "Chocolate Lava Cake", price: 149, imageUrl: "images/chocoLava.jpg", category: "Dessert", description: "Warm chocolate cake." }
];

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(data);
    console.log("✅ Menu seeded");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
