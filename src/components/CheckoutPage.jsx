import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api";

export default function CheckoutPage({
  cartItems,
  totalPrice,
  user,
  onBack,
  onShowToast,
}) {
  const { clearCart, setIsCartOpen } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.address || !formData.city || !formData.phone) {
      if (onShowToast)
        onShowToast("Please fill in all shipping details", "warning");
      return;
    }

    if (cartItems.length === 0) {
      if (onShowToast) onShowToast("Your cart is empty!", "warning");
      return;
    }

    const orderData = {
      buyerId: user?._id || user?.id || "guest",
      buyerEmail: formData.email || user?.email || "guest@kotla.com",
      buyerName: formData.fullName || user?.name || "Valued Customer",
      items: cartItems.map((item) => ({
        productId: item._id || item.id,
        name: item.name,
        price: item.currentPrice,
        quantity: item.quantity,
        sellerId: item.sellerId,
      })),
      totalAmount: totalPrice,
      paymentMethod: "Cash on Delivery (COD)",
      shippingAddress: `${formData.address}, ${formData.city} (Phone: ${formData.phone})`,
      createdAt: new Date().toISOString(),
    };

    try {
      // ✨ Yahan API call uncomment kar di hai taake backend par request jaye!
      await createOrder(orderData);

      if (onShowToast) {
        onShowToast(
          "🎉 Order placed successfully! Confirmation email sent.",
          "success"
        );
      }

      if (typeof clearCart === "function") clearCart();
      onBack();
    } catch (err) {
      if (onShowToast) {
        onShowToast("❌ Failed to place order. Try again.", "error");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#2563EB",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "20px",
          fontSize: "14px",
        }}
      >
        ← Back to Shopping
      </button>

      <h2
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          color: "#1E293B",
          marginBottom: "8px",
        }}
      >
        📦 Secure Checkout (Cash on Delivery)
      </h2>
      <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "25px" }}>
        Enter your shipping details to complete your order.
      </p>

      <form onSubmit={handlePlaceOrder}>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Email Address (For Notification)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            placeholder="0300-1234567"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Street Address
          </label>
          <input
            type="text"
            name="address"
            placeholder="House #123, Street #4"
            value={formData.address}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            City
          </label>
          <input
            type="text"
            name="city"
            placeholder="Kotla / Lahore / Islamabad"
            value={formData.city}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: "#F8FAFC",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "25px",
            border: "1px solid #E2E8F0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "15px",
              fontWeight: "bold",
              color: "#1E293B",
            }}
          >
            <span>Total Payable Amount:</span>
            <span style={{ color: "#2563EB" }}>₨ {totalPrice}</span>
          </div>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: "#16A34A",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0 4px 6px rgba(22, 163, 74, 0.2)",
          }}
        >
          Confirm & Place Order (COD)
        </button>
      </form>
    </div>
  );
}
