const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mailgun = require("mailgun.js");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const PORT = process.env.PORT || 5000;

const mg = new mailgun(FormData);
const domain = process.env.MAILGUN_DOMAIN;
const client = mg.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/kotla-marketplace"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Email function - FIXED ✅
async function sendEmail(toEmail, subject, htmlContent) {
  try {
    const messageData = {
      from: `Kotla Marketplace <postmaster@${domain}>`, // ✅ CHANGED from mailgun@ to postmaster@
      to: toEmail,
      subject: subject,
      html: htmlContent,
    };

    await client.messages.create(domain, messageData);
    console.log(`✅ Email sent to ${toEmail}`);
  } catch (error) {
    console.error(`❌ Mailgun Error for ${toEmail}:`, error.message);
  }
}

// Schemas
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

// API Routes
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

// ORDER ENDPOINT - EMAILS SEND HOTA HAI
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

    console.log("📋 ORDER RECEIVED:");
    console.log("Buyer:", buyerName, buyerEmail);
    console.log("Items:", items.length);

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

    // Update products
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { sold: item.quantity, stock: -item.quantity },
      });
    }

    // ========== SEND TO BUYER ==========
    if (buyerEmail) {
      console.log("📧 Sending email to BUYER:", buyerEmail);
      sendEmail(
        buyerEmail,
        "🎉 Order Confirmed - Kotla Marketplace",
        `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #333;">Hello ${buyerName}!</h2>
          <p>Thank you for your order! ✅</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #d32f2f;">Order Summary</h3>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Total Amount:</strong> ₨${totalAmount}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
            <p><strong>Items:</strong> ${items.length}</p>
          </div>
          
          <p>We will notify you once your order is shipped. Thank you for shopping with us!</p>
          <p style="color: #999; font-size: 12px;">© 2026 Kotla Marketplace</p>
        </div>
        `
      );
    } else {
      console.log("❌ NO BUYER EMAIL PROVIDED");
    }

    // ========== SEND TO SELLERS ==========
    const sellerIds = [
      ...new Set(items.map((i) => i.sellerId).filter(Boolean)),
    ];
    console.log("🏪 Seller IDs:", sellerIds);

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

        console.log("📧 Sending email to SELLER:", sellerEmail);
        sendEmail(
          sellerEmail,
          "📦 New Order Received - Kotla Marketplace",
          `
          <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #333;">New Order from ${buyerName}! 🎉</h2>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #d32f2f;">Order Details</h3>
              <p><strong>Buyer:</strong> ${buyerName}</p>
              <p><strong>Email:</strong> ${buyerEmail}</p>
              <p><strong>Phone:</strong> Check order details</p>
              <p><strong>Items Ordered:</strong> ${sellerItems.length}</p>
              <p><strong>Your Total Earnings:</strong> ₨${sellerTotal}</p>
              <p><strong>Delivery Address:</strong> ${shippingAddress}</p>
            </div>
            
            <p>Please prepare the items for shipment. Thank you!</p>
            <p style="color: #999; font-size: 12px;">© 2026 Kotla Marketplace</p>
          </div>
          `
        );
      } else {
        console.log("❌ NO EMAIL FOUND FOR SELLER:", sellerId);
      }
    }

    // ========== SEND TO ADMIN ==========
    const adminEmail = process.env.ADMIN_EMAIL;
    console.log("🔐 Admin Email:", adminEmail);

    if (adminEmail) {
      console.log("📧 Sending email to ADMIN:", adminEmail);
      sendEmail(
        adminEmail,
        `🚨 New Order #${order._id} - Admin Alert`,
        `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #d32f2f;">⚠️ New Order Alert</h2>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Buyer:</strong> ${buyerName}</p>
            <p><strong>Email:</strong> ${buyerEmail}</p>
            <p><strong>Total Amount:</strong> ₨${totalAmount}</p>
            <p><strong>Items:</strong> ${items.length}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Address:</strong> ${shippingAddress}</p>
          </div>
          
          <p>Please monitor this order.</p>
          <p style="color: #999; font-size: 12px;">© 2026 Kotla Marketplace - Admin Panel</p>
        </div>
        `
      );
    } else {
      console.log("❌ NO ADMIN EMAIL IN ENV VARIABLES");
    }

    res.json({
      success: true,
      message: "Order placed successfully & notifications dispatched ✅",
      order,
    });
  } catch (error) {
    console.error("❌ ORDER ERROR:", error.message);
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
║   Mailgun Email: ✅ CONFIGURED      ║
║   mg.kotlamarketplace.com           ║
║   http://localhost:${PORT}             ║
╚══════════════════════════════════════╝
  `);
});
