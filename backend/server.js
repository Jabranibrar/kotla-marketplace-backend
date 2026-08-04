const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Resend } = require("resend");
const { getOrderEmailTemplate } = require("./emailTemplate");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const PORT = process.env.PORT || 5000;

const resend = new Resend(process.env.RESEND_API_KEY);

mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/kotla-marketplace"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  type: String,
  shopName: String,
  commission: { type: Number, default: 0 },
});
const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  sellerId: String,
  name: String,
  originalPrice: Number,
  currentPrice: Number,
  discount: Number,
  stock: Number,
  sold: { type: Number, default: 0 },
  category: String,
  image: String,
  description: String,
});
const Product = mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
  buyerId: String,
  buyerName: String,
  buyerEmail: String,
  shippingAddress: String,
  paymentMethod: String,
  totalAmount: Number,
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      quantity: Number,
      sellerId: String,
    },
  ],
  createdAt: { type: String, default: () => new Date().toISOString() },
});
const Order = mongoose.model("Order", orderSchema);

const addressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    label: { type: String, default: "HOME" },
    address: { type: String, required: true },
    region: { type: String, required: true },
  },
  { timestamps: true }
);
const Address = mongoose.model("Address", addressSchema);

async function sendResendEmail(toEmail, subject, htmlContent) {
  try {
    const data = await resend.emails.send({
      from: "Kotla Marketplace <onboarding@resend.dev>",
      to: [toEmail],
      subject: subject,
      html: htmlContent,
    });
    console.log(`✅ Email sent successfully to ${toEmail}:`, data);
  } catch (error) {
    console.error(`❌ Resend API Error for ${toEmail}:`, error.message);
  }
}

app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend is running!" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, type, shopName } = req.body;
    const user = new User({
      name,
      email,
      password,
      phone,
      type,
      shopName,
      commission: 0,
    });
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

app.get("/api/products/seller/:sellerId", async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const {
      sellerId,
      name,
      originalPrice,
      currentPrice,
      stock,
      category,
      image,
    } = req.body;
    const discount = originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    const product = new Product({
      sellerId,
      name,
      originalPrice,
      currentPrice,
      discount,
      stock,
      category,
      image,
    });
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { originalPrice, currentPrice } = req.body;
    if (originalPrice && currentPrice) {
      req.body.discount = Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100
      );
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/addresses/:userId", async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/addresses", async (req, res) => {
  try {
    const newAddress = new Address(req.body);
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const {
      buyerId,
      buyerName,
      buyerEmail,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    } = req.body;

    const order = new Order({
      buyerId,
      buyerName,
      buyerEmail,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    await order.save();

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { sold: item.quantity, stock: -item.quantity },
      });
    }

    if (buyerEmail) {
      sendResendEmail(
        buyerEmail,
        "🎉 Order Confirmed - Kotla Marketplace",
        getOrderEmailTemplate(
          buyerName,
          paymentMethod,
          items,
          shippingAddress,
          totalAmount
        )
      );
    }

    const sellerIds = [
      ...new Set(items.map((i) => i.sellerId).filter(Boolean)),
    ];
    const validSellerIds = sellerIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    const sellers =
      validSellerIds.length > 0
        ? await User.find({ _id: { $in: validSellerIds } })
        : [];

    const sellerEmailMap = {};
    sellers.forEach((s) => {
      sellerEmailMap[s._id.toString()] = s.email;
    });

    for (const sellerId of sellerIds) {
      const sellerEmail = sellerEmailMap[sellerId];
      if (sellerEmail) {
        const sellerItems = items.filter(
          (i) => String(i.sellerId) === String(sellerId)
        );
        const sellerTotal = sellerItems.reduce(
          (acc, curr) => acc + curr.price * curr.quantity,
          0
        );

        sendResendEmail(
          sellerEmail,
          "📦 New Order Received for Your Shop! - Kotla Marketplace",
          getOrderEmailTemplate(
            `Seller (${buyerName} ordered)`,
            paymentMethod,
            sellerItems,
            shippingAddress,
            sellerTotal
          )
        );
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendResendEmail(
        adminEmail,
        `🚨 New Order Placed (#${order._id}) - Admin Alert`,
        getOrderEmailTemplate(
          `Admin Report (${buyerName})`,
          paymentMethod,
          items,
          shippingAddress,
          totalAmount
        )
      );
    }

    res.json({
      success: true,
      message: "Order placed successfully & notifications dispatched",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/seller/stats/:sellerId", async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId });
    const allOrders = await Order.find();
    const sellerOrders = allOrders.filter((order) =>
      order.items.some(
        (item) => String(item.sellerId) === String(req.params.sellerId)
      )
    );

    const totalSales = sellerOrders.reduce((sum, order) => {
      const sellerItemsSum = order.items
        .filter((item) => String(item.sellerId) === String(req.params.sellerId))
        .reduce((acc, item) => acc + item.price * item.quantity, 0);
      return sum + sellerItemsSum;
    }, 0);

    res.json({
      stats: {
        totalProducts: products.length,
        totalOrders: sellerOrders.length,
        totalSales,
        totalCommission: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🚀 KOTLA MARKETPLACE BACKEND      ║
║   Server running on port ${PORT}      ║
║   http://localhost:${PORT}             ║
╚══════════════════════════════════════╝
  `);
});
