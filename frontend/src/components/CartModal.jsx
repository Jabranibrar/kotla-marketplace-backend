import React, { useState } from "react";
import { useCart } from "../context/CartContext";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";

export default function CartModal({ onShowToast, onCheckout }) {
  // ✨ onCheckout prop add kiya
  const { cartItems, removeFromCart, totalPrice, isCartOpen, setIsCartOpen } =
    useCart();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      if (onShowToast) onShowToast("Your cart is empty!", "warning");
      return;
    }

    setIsCartOpen(false); // Modal band karo
    if (onCheckout) {
      onCheckout(); // App.js ko bolo ke checkout page par le jao
    }
  };

  const confirmDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (!itemToDelete) return;
    removeFromCart(itemToDelete._id);
    if (onShowToast) {
      onShowToast("🗑️ Item removed from cart", "success");
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 3000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          width: "100%",
          maxWidth: "420px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-5px 0 25px rgba(0,0,0,0.1)",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E2E8F0",
            paddingBottom: "15px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#1E293B",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🛒 Your Shopping Cart
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "#64748B",
            }}
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "15px 0" }}>
          {cartItems.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#94A3B8",
                marginTop: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <svg
                width="60"
                height="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                style={{ color: "#CBD5E1" }}
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#475569",
                  margin: 0,
                }}
              >
                Your cart is empty
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2563EB",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "15px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <img
                  src={
                    item.image && item.image.trim() !== ""
                      ? item.image
                      : DEFAULT_PRODUCT_IMAGE
                  }
                  alt={item.name}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    {item.name}
                  </h4>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "13px",
                      color: "#2563EB",
                      fontWeight: "600",
                    }}
                  >
                    ₨ {item.currentPrice} x {item.quantity}
                  </p>
                  <button
                    onClick={() => confirmDeleteClick(item)}
                    style={{
                      backgroundColor: "#FEF2F2",
                      color: "#DC2626",
                      border: "1px solid #FECACA",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "15px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1E293B",
              }}
            >
              <span>Total Amount:</span>
              <span style={{ color: "#2563EB" }}>₨ {totalPrice}</span>
            </div>
            <button
              onClick={handleCheckoutClick}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#16A34A",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "15px",
                boxShadow: "0 4px 6px rgba(22, 163, 74, 0.2)",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Popup */}
      {deleteModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 4000,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "25px 30px",
              borderRadius: "12px",
              maxWidth: "380px",
              width: "90%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚠️</div>
            <h3
              style={{
                fontSize: "18px",
                color: "#1E293B",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Remove Item?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#64748B",
                marginBottom: "20px",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to remove{" "}
              <b style={{ color: "#0F172A" }}>"{itemToDelete?.name}"</b> from
              your cart?
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#F1F5F9",
                  color: "#334155",
                  border: "1px solid #CBD5E1",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#DC2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
