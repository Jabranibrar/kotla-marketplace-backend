const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

mongoose
  .connect("mongodb://localhost:27017/kotla-marketplace")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  type: String,
  shopName: String,
  commission: { type: Number, default: 8 },
});
const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  sellerId: mongoose.Schema.Types.ObjectId,
  name: String,
  originalPrice: Number,
  currentPrice: Number,
  discount: Number,
  stock: Number,
  sold: { type: Number, default: 0 },
  category: String,
});
const Product = mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
  buyerId: mongoose.Schema.Types.ObjectId,
  sellerId: mongoose.Schema.Types.ObjectId,
  productId: mongoose.Schema.Types.ObjectId,
  quantity: Number,
  totalPrice: Number,
  commission: Number,
  status: { type: String, default: "completed" },
});
const Order = mongoose.model("Order", orderSchema);

app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend is running!" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, type, shopName } = req.body;
    const user = new User({ name, email, password, phone, type, shopName });
    await user.save();
    res.json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { sellerId, name, originalPrice, currentPrice, stock, category } =
      req.body;
    const discount = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100
    );
    const product = new Product({
      sellerId,
      name,
      originalPrice,
      currentPrice,
      discount,
      stock,
      category,
    });
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { buyerId, sellerId, productId, quantity, totalPrice } = req.body;
    const commission = Math.round(totalPrice * 0.08);
    const order = new Order({
      buyerId,
      sellerId,
      productId,
      quantity,
      totalPrice,
      commission,
    });
    await order.save();
    await Product.findByIdAndUpdate(productId, {
      $inc: { sold: quantity, stock: -quantity },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/seller/stats/:sellerId", async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId });
    const orders = await Order.find({ sellerId: req.params.sellerId });
    const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0);
    res.json({
      stats: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalSales,
        totalCommission,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🚀 KOTLA MARKETPLACE BACKEND      ║
║   Server running on port ${PORT}      ║
║   http://localhost:${PORT}             ║
╚══════════════════════════════════════╝
  `);
});
