import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

// ✨ Professional Category-wise Fallback Images & Descriptions
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
}) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when modal opens for a new product
  useEffect(() => {
    setQuantity(1);
  }, [product]);

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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    if (typeof onShowToast === "function") {
      onShowToast(`Added ${quantity} item(s) to cart!`, "success");
    }
    onClose();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    onClose();
    if (typeof onDirectCheckout === "function") {
      onDirectCheckout();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* ✨ Dynamic Professional Image Box */}
        <div
          className="modal-image-box"
          style={{ backgroundColor: "#F8FAFC", position: "relative" }}
        >
          <img
            src={finalImage}
            alt={product.name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "cover",
              width: "100%",
              height: "100%",
              borderRadius: "8px",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              color: "#FFFFFF",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {product.category || "General"}
          </span>
        </div>

        <div className="modal-content-box">
          <div>
            <h2 className="modal-title">{product.name}</h2>

            {/* ✨ Dynamic Category-based Description */}
            <p
              style={{
                fontSize: "14px",
                color: "#64748B",
                margin: "0 0 15px 0",
                lineHeight: "1.5",
              }}
            >
              {finalDescription}
            </p>

            <div className="modal-price">
              ₨{calculatedPrice}
              {product.originalPrice && (
                <span
                  className="product-original-price"
                  style={{ marginLeft: "10px" }}
                >
                  ₨{product.originalPrice * quantity}
                </span>
              )}
            </div>

            <div className="quantity-box">
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                }}
              >
                Quantity:
              </span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                >
                  -
                </button>
                <span
                  style={{
                    padding: "0 20px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  {quantity}
                </span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="daraz-action-buttons">
            <button className="btn-daraz-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="btn-daraz-buynow" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
