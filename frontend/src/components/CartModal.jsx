import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/cartModal.css";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";

export default function CartModal({ onShowToast, onCheckout }) {
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

    setIsCartOpen(false);
    if (onCheckout) {
      onCheckout();
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
      onShowToast("Item removed from cart", "success");
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="kotla-cart-overlay">
      <div className="kotla-cart-drawer">
        {/* Header */}
        <div className="kotla-cart-header">
          <div className="kotla-cart-title-wrapper">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
            </svg>
            <h2>Shopping Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="kotla-cart-close-btn"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="kotla-cart-body">
          {cartItems.length === 0 ? (
            <div className="kotla-empty-cart">
              <svg
                width="64"
                height="64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <p>Your cart is empty</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="kotla-continue-shopping-btn"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="kotla-cart-item">
                <img
                  src={
                    item.image && item.image.trim() !== ""
                      ? item.image
                      : DEFAULT_PRODUCT_IMAGE
                  }
                  alt={item.name}
                  className="kotla-cart-item-img"
                />
                <div className="kotla-cart-item-details">
                  <h4 className="kotla-cart-item-name">{item.name}</h4>
                  <p className="kotla-cart-item-price">
                    ₨ {item.currentPrice} x {item.quantity}
                  </p>
                  <button
                    onClick={() => confirmDeleteClick(item)}
                    className="kotla-cart-remove-btn"
                  >
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {cartItems.length > 0 && (
          <div className="kotla-cart-footer">
            <div className="kotla-cart-total-row">
              <span>Total Amount:</span>
              <span>₨ {totalPrice}</span>
            </div>
            <button
              onClick={handleCheckoutClick}
              className="kotla-checkout-btn"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Popup */}
      {deleteModalOpen && (
        <div className="kotla-confirm-overlay">
          <div className="kotla-confirm-card">
            <div className="kotla-confirm-icon">
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3>Remove Item</h3>
            <p>
              Are you sure you want to remove <b>"{itemToDelete?.name}"</b> from
              your cart?
            </p>

            <div className="kotla-confirm-actions">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="kotla-confirm-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="kotla-confirm-delete-btn"
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
