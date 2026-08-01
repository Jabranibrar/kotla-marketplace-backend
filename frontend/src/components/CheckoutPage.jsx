import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api";
import "../styles/checkoutPage.css";

export default function CheckoutPage({
  cartItems,
  totalPrice,
  user,
  onBack,
  onShowToast,
}) {
  const { clearCart } = useCart();

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
      await createOrder(orderData);

      if (onShowToast) {
        onShowToast(
          "Order placed successfully! Confirmation email sent.",
          "success"
        );
      }

      if (typeof clearCart === "function") clearCart();
      onBack();
    } catch (err) {
      if (onShowToast) {
        onShowToast("Failed to place order. Try again.", "error");
      }
    }
  };

  return (
    <div className="kotla-checkout-wrapper">
      {/* Back Button */}
      <button onClick={onBack} className="kotla-checkout-back-btn">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Shopping
      </button>

      {/* Header */}
      <div className="kotla-checkout-header">
        <h2>
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          Secure Checkout (Cash on Delivery)
        </h2>
        <p>Enter your shipping details to complete your order.</p>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="kotla-checkout-form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Enter full name"
          />
        </div>

        <div className="kotla-checkout-form-group">
          <label>Email Address (For Notification)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="name@example.com"
          />
        </div>

        <div className="kotla-checkout-form-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            placeholder="0300-1234567"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="kotla-checkout-form-group">
          <label>Street Address</label>
          <input
            type="text"
            name="address"
            placeholder="House #123, Street #4"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="kotla-checkout-form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            placeholder="Kotla / Lahore / Islamabad"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="kotla-checkout-summary-box">
          <span>Total Payable Amount:</span>
          <span>₨ {totalPrice}</span>
        </div>

        <button type="submit" className="kotla-place-order-btn">
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Confirm & Place Order (COD)
        </button>
      </form>
    </div>
  );
}
