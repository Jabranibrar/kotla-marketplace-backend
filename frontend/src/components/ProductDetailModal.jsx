import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import "../styles/productDetailModal.css";

const CATEGORY_DEFAULTS = {
  electronics: {
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "High-performance electronic device with advanced features, sleek design, and guaranteed durability.",
  },
  fashion: {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Premium quality fashion wear crafted with comfortable fabric, modern style, and perfect fit.",
  },
  tools: {
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Heavy-duty professional grade tool built for efficiency, safety, and long-lasting performance.",
  },
  beauty: {
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Top-tier premium beauty and personal care product designed for safe, flawless results.",
  },
};

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onShowToast,
  onDirectCheckout,
  user,
  onOpenLoginModal,
}) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const availableStock =
    product?.stock !== undefined ? Number(product.stock) : 10;

  useEffect(() => {
    setQuantity(availableStock > 0 ? 1 : 0);
  }, [product, availableStock]);

  if (!isOpen || !product) return null;

  const calculatedPrice = product.currentPrice * quantity;
  const categoryKey = product.category
    ? product.category.toLowerCase()
    : "electronics";
  const defaultFallback =
    CATEGORY_DEFAULTS[categoryKey] || CATEGORY_DEFAULTS.electronics;

  const finalImage =
    product.image && product.image.trim() !== ""
      ? product.image
      : defaultFallback.image;
  const finalDescription =
    product.description && product.description.trim() !== ""
      ? product.description
      : defaultFallback.desc;

  // ✨ Robust Authentication & Login Modal Trigger
  const checkAuthAndProceed = (actionCallback) => {
    const isUserLoggedIn = user && (user._id || user.id || user.email);

    if (!isUserLoggedIn) {
      onClose(); // Product modal band karo

      if (typeof onOpenLoginModal === "function") {
        onOpenLoginModal(); // Pass kiya hua login modal function chalao
      } else {
        // Fallback agar prop na mile toh custom event dispatch karo taake app ka main navbar/layout login modal khol de
        window.dispatchEvent(new CustomEvent("open-login-modal"));
      }
      return;
    }
    actionCallback();
  };

  const handleAddToCart = () => {
    checkAuthAndProceed(() => {
      if (availableStock <= 0) {
        if (typeof onShowToast === "function")
          onShowToast("Product is out of stock!", "error");
        return;
      }
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      if (typeof onShowToast === "function") {
        onShowToast(`Added ${quantity} item(s) to cart!`, "success");
      }
      onClose();
    });
  };

  const handleBuyNow = () => {
    checkAuthAndProceed(() => {
      if (availableStock <= 0) {
        if (typeof onShowToast === "function")
          onShowToast("Product is out of stock!", "error");
        return;
      }
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      onClose();
      if (typeof onDirectCheckout === "function") {
        onDirectCheckout();
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="modal-image-box">
          <img
            src={finalImage}
            alt={product.name}
            className="modal-product-img"
          />
          <span className="modal-category-badge">
            {product.category || "General"}
          </span>
        </div>

        <div className="modal-content-box">
          <div>
            <h2 className="modal-title">{product.name}</h2>
            <p className="modal-description">{finalDescription}</p>

            <div className="modal-price">
              ₨{calculatedPrice}
              {product.originalPrice && (
                <span className="product-original-price">
                  ₨{product.originalPrice * quantity}
                </span>
              )}
            </div>

            <div className="stock-status-box">
              {availableStock > 0 ? (
                <span className="stock-in">
                  🟢 In Stock: {availableStock} available
                </span>
              ) : (
                <span className="stock-out">🔴 Out of Stock</span>
              )}
            </div>

            {availableStock > 0 ? (
              <div className="quantity-box">
                <span className="quantity-label">Quantity:</span>
                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() =>
                      setQuantity((q) => (q < availableStock ? q + 1 : q))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="out-of-stock-alert">Currently Out of Stock</div>
            )}
          </div>

          <div className="daraz-action-buttons">
            <button
              className="btn-daraz-cart"
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
            >
              Add to Cart
            </button>
            <button
              className="btn-daraz-buynow"
              onClick={handleBuyNow}
              disabled={availableStock <= 0}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
