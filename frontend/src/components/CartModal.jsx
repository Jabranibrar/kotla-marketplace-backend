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

  const formatPrice = (price) => {
    const numericPrice = Number(price) || 0;
    return numericPrice.toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalItems = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      if (onShowToast) {
        onShowToast("Your cart is empty!", "warning");
      }
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

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="kotla-cart-overlay">
      <div className="kotla-cart-drawer">
        <div className="kotla-cart-header">
          <div className="kotla-cart-heading">
            <div className="kotla-cart-heading-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M6 8h12l1 13H5L6 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
            </div>

            <div>
              <h2>Shopping Cart</h2>
              <p>
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="kotla-cart-close-btn"
            aria-label="Close shopping cart"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="kotla-cart-body">
          {cartItems.length === 0 ? (
            <div className="kotla-empty-cart">
              <div className="kotla-empty-cart-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M6 8h12l1 13H5L6 8Z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
              </div>

              <h3>Your cart is empty</h3>

              <p>Looks like you haven't added anything to your cart yet.</p>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="kotla-continue-shopping-btn"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="kotla-cart-items-list">
              {cartItems.map((item) => {
                const itemPrice = Number(item.currentPrice) || 0;
                const quantity = Number(item.quantity) || 0;
                const itemTotal = itemPrice * quantity;

                return (
                  <div key={item._id} className="kotla-cart-item">
                    <div className="kotla-cart-item-image-wrapper">
                      <img
                        src={
                          item.image && item.image.trim() !== ""
                            ? item.image
                            : DEFAULT_PRODUCT_IMAGE
                        }
                        alt={item.name}
                        className="kotla-cart-item-img"
                      />
                    </div>

                    <div className="kotla-cart-item-details">
                      <h4 className="kotla-cart-item-name">{item.name}</h4>

                      <div className="kotla-cart-item-meta">
                        <span className="kotla-cart-item-quantity">
                          Qty {quantity}
                        </span>

                        <span className="kotla-cart-item-unit-price">
                          ₨ {formatPrice(itemPrice)}
                        </span>
                      </div>

                      <div className="kotla-cart-item-bottom">
                        <strong className="kotla-cart-item-total">
                          ₨ {formatPrice(itemTotal)}
                        </strong>

                        <button
                          type="button"
                          onClick={() => confirmDeleteClick(item)}
                          className="kotla-cart-remove-btn"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path d="M4 7h16" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M6 7l1 14h10l1-14" />
                            <path d="M9 7V4h6v3" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="kotla-cart-footer">
            <div className="kotla-cart-summary">
              <div className="kotla-cart-summary-row">
                <span>Subtotal</span>
                <span>₨ {formatPrice(totalPrice)}</span>
              </div>

              <div className="kotla-cart-summary-row kotla-cart-total-row">
                <span>Total</span>
                <strong>₨ {formatPrice(totalPrice)}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckoutClick}
              className="kotla-checkout-btn"
            >
              <span>Proceed to Checkout</span>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </button>

            <p className="kotla-cart-secure-note">
              Secure checkout • Cash on Delivery available
            </p>
          </div>
        )}
      </div>

      {deleteModalOpen && (
        <div
          className="kotla-confirm-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="kotla-confirm-card">
            <div className="kotla-confirm-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M12 3.5 21 20H3L12 3.5Z" />
                <path d="M12 9v5" />
                <path d="M12 17.5h.01" />
              </svg>
            </div>

            <h3>Remove item?</h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>"{itemToDelete?.name}"</strong> from your cart?
            </p>

            <div className="kotla-confirm-actions">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="kotla-confirm-cancel-btn"
              >
                Keep Item
              </button>

              <button
                type="button"
                onClick={executeDelete}
                className="kotla-confirm-delete-btn"
              >
                Remove Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
