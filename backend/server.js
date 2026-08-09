const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mailgun = require("mailgun.js");
const FormData = require("form-data");
const twilio = require("twilio");
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

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/kotla-marketplace"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

async function sendEmail(toEmail, subject, htmlContent) {
  try {
    const messageData = {
      from: `Kotla Marketplace <postmaster@${domain}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    };
    await client.messages.create(domain, messageData);
    console.log(`✅ Email sent to ${toEmail}`);
  } catch (error) {
    console.error(`❌ Email Error: ${error.message}`);
  }
}

async function sendWhatsApp(buyerPhone, buyerName, orderDetails) {
  try {
    let formattedPhone = buyerPhone.trim();
    if (!formattedPhone.startsWith("+")) {
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+92" + formattedPhone.substring(1);
      } else {
        formattedPhone = "+92" + formattedPhone;
      }
    }

    const message = await twilioClient.messages.create({
      body: `Dear ${buyerName},

Thank you for your order! 🎉

📦 Order Details:
Order #: ${orderDetails.orderId}
Total: ₨${orderDetails.total}
Items: ${orderDetails.itemCount}
Address: ${orderDetails.address}
Payment: ${orderDetails.paymentMethod}

Status: Processing ⏳
Expected delivery: 2-3 days

Thank you,
Kotla Marketplace 🙏`,
      from: twilioWhatsAppNumber,
      to: `whatsapp:${formattedPhone}`,
    });

    console.log(`✅ WhatsApp sent to ${formattedPhone}`);
  } catch (error) {
    console.error(`❌ WhatsApp Error: ${error.message}`);
  }
}

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
  buyerPhone: String,
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

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, originalPrice, currentPrice, stock, category, image } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const discount = originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        originalPrice,
        currentPrice,
        discount,
        stock,
        category,
        image,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Product updated",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ sellerId });
    res.json(products);
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
      buyerPhone,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    } = req.body;

    console.log("📋 ORDER:", buyerName, buyerEmail);

    const order = new Order({
      buyerId,
      buyerName,
      buyerEmail,
      buyerPhone,
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
      console.log("📧 Email to BUYER:", buyerEmail);
      sendEmail(
        buyerEmail,
        "🎉 Order Confirmed - Kotla Marketplace",
        `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2>Hello ${buyerName}!</h2>
          <p>Thank you for your order! ✅</p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #d32f2f;">Order Summary</h3>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Total Amount:</strong> ₨${totalAmount}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Address:</strong> ${shippingAddress}</p>
            <p><strong>Items:</strong> ${items.length}</p>
          </div>
          <p>We will notify you soon. Thank you!</p>
        </div>`
      );
    }

    if (buyerPhone) {
      console.log("💬 WhatsApp to BUYER:", buyerPhone);
      sendWhatsApp(buyerPhone, buyerName, {
        orderId: order._id,
        total: totalAmount,
        itemCount: items.length,
        address: shippingAddress,
        paymentMethod: paymentMethod,
      });
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

        console.log("📧 Email to SELLER:", sellerEmail);
        sendEmail(
          sellerEmail,
          "📦 New Order Received - Kotla Marketplace",
          `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2>New Order from ${buyerName}! 🎉</h2>
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #d32f2f;">Order Details</h3>
              <p><strong>Buyer:</strong> ${buyerName}</p>
              <p><strong>Email:</strong> ${buyerEmail}</p>
              <p><strong>Phone:</strong> ${buyerPhone || "N/A"}</p>
              <p><strong>Items:</strong> ${sellerItems.length}</p>
              <p><strong>Your Earnings:</strong> ₨${sellerTotal}</p>
              <p><strong>Address:</strong> ${shippingAddress}</p>
            </div>
            <p>Please prepare items for shipment!</p>
          </div>`
        );
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      console.log("📧 Email to ADMIN:", adminEmail);
      sendEmail(
        adminEmail,
        `🚨 New Order #${order._id}`,
        `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #d32f2f;">New Order Alert</h2>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Buyer:</strong> ${buyerName}</p>
            <p><strong>Email:</strong> ${buyerEmail}</p>
            <p><strong>Phone:</strong> ${buyerPhone || "N/A"}</p>
            <p><strong>Total:</strong> ₨${totalAmount}</p>
            <p><strong>Items:</strong> ${items.length}</p>
            <p><strong>Address:</strong> ${shippingAddress}</p>
          </div>
        </div>`
      );
    }

    res.json({
      success: true,
      message: "Order placed & notifications sent ✅",
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
╔════════════════════════════════════╗
║  🚀 KOTLA MARKETPLACE BACKEND      ║
║  Port: ${PORT}                          ║
║  Mailgun: ✅ Configured             ║
║  Twilio: ✅ Configured              ║
╚════════════════════════════════════╝
  `);
});
