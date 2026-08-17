import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import "../styles/productDetailModal.css";

const CATEGORY_DEFAULTS = {
  electronics: {
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    desc: "High-performance electronic device with advanced features, sleek design, and guaranteed durability.",
  },
  fashion: {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    desc: "Premium quality fashion wear crafted with comfortable fabric, modern style, and perfect fit.",
  },
  tools: {
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    desc: "Heavy-duty professional grade tool built for efficiency, safety, and long-lasting performance.",
  },
  beauty: {
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    desc: "Top-tier premium beauty and personal care product designed for safe, flawless results.",
  },
  cloths: {
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    desc: "Premium quality fabric and clothing product selected for comfort, durability, and everyday style.",
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");

  const availableStock =
    product?.stock !== undefined ? Number(product.stock) : 10;

  useEffect(() => {
    setQuantity(availableStock > 0 ? 1 : 0);
    setIsZoomed(false);
    setZoomOrigin("50% 50%");
  }, [product, availableStock]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const calculatedPrice = Number(product.currentPrice || 0) * quantity;

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

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-PK");
  };

  const checkAuthAndProceed = (actionCallback) => {
    const isUserLoggedIn = user && (user._id || user.id || user.email);

    if (!isUserLoggedIn) {
      onClose();

      if (typeof onOpenLoginModal === "function") {
        onOpenLoginModal();
      } else {
        window.dispatchEvent(new CustomEvent("open-login-modal"));
      }

      return;
    }

    actionCallback();
  };

  const handleAddToCart = () => {
    checkAuthAndProceed(() => {
      if (availableStock <= 0) {
        if (typeof onShowToast === "function") {
          onShowToast("Product is out of stock!", "error");
        }
        return;
      }

      for (let i = 0; i < quantity; i += 1) {
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
        if (typeof onShowToast === "function") {
          onShowToast("Product is out of stock!", "error");
        }
        return;
      }

      for (let i = 0; i < quantity; i += 1) {
        addToCart(product);
      }

      onClose();

      if (typeof onDirectCheckout === "function") {
        onDirectCheckout();
      }
    });
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleImageMouseMove = (event) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomOrigin(`${x}% ${y}%`);
    setIsZoomed(true);
  };

  const handleImageMouseLeave = () => {
    setIsZoomed(false);
    setZoomOrigin("50% 50%");
  };

  return (
    <div
      className="product-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} details`}
      onClick={handleOverlayClick}
    >
      <div className="modal-container">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close product details"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="modal-image-box">
          <div
            className={`modal-image-zoom-area ${isZoomed ? "is-zoomed" : ""}`}
            onMouseMove={handleImageMouseMove}
            onMouseEnter={handleImageMouseMove}
            onMouseLeave={handleImageMouseLeave}
          >
            <img
              src={finalImage}
              alt={product.name}
              className="modal-product-img"
              style={{
                transformOrigin: zoomOrigin,
              }}
            />

            <div className="modal-zoom-hint">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
                <path d="M11 8v6" />
                <path d="M8 11h6" />
              </svg>
              <span>Hover to zoom</span>
            </div>
          </div>
        </div>

        <div className="modal-content-box">
          <div className="modal-product-content">
            <span className="modal-product-eyebrow">
              {product.category || "Product"}
            </span>

            <h2 className="modal-title">{product.name}</h2>

            <p className="modal-description">{finalDescription}</p>

            <div className="modal-price-row">
              <div className="modal-price">
                <span className="modal-currency">₨</span>
                {formatPrice(calculatedPrice)}
              </div>

              {product.originalPrice && (
                <span className="product-original-price">
                  ₨{formatPrice(Number(product.originalPrice) * quantity)}
                </span>
              )}

              {product.discount > 0 && (
                <span className="modal-discount-badge">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <div className="stock-status-box">
              {availableStock > 0 ? (
                <>
                  <span className="stock-status-dot" />
                  <span className="stock-in">In Stock</span>
                  <span className="stock-available">
                    {availableStock} available
                  </span>
                </>
              ) : (
                <>
                  <span className="stock-status-dot out" />
                  <span className="stock-out">Out of Stock</span>
                </>
              )}
            </div>

            {availableStock > 0 ? (
              <div className="quantity-box">
                <span className="quantity-label">Quantity</span>

                <div className="quantity-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span className="qty-value">{quantity}</span>

                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() =>
                      setQuantity((q) => (q < availableStock ? q + 1 : q))
                    }
                    disabled={quantity >= availableStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="out-of-stock-alert">Currently unavailable</div>
            )}
          </div>

          <div className="daraz-action-buttons">
            <button
              type="button"
              className="btn-daraz-cart"
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M6 8h12l1 13H5L6 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              Add to Cart
            </button>

            <button
              type="button"
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
