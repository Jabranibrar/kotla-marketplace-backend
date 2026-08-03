import React, { useEffect, useState } from "react";
import { getProducts } from "../api";
import { useCart } from "../context/CartContext";
import ProductDetailModal from "./ProductDetailModal";
import "../styles/main.css";

// ✨ Professional Clothing & Marketplace Default Image Fallback
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";

export default function Home({
  searchQuery,
  setSearchQuery,
  onShowToast,
  onDirectCheckout,
  user, // 👈 Yahan user prop receive ki
  onOpenLoginModal, // 👈 Yahan login modal open function receive kiya
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        if (typeof onShowToast === "function") {
          onShowToast("Error loading products", "error");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [onShowToast]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes((searchQuery || "").toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { name: "All", label: "🔥 All Products", bg: "#F1F5F9", color: "#334155" },
    {
      name: "cloths",
      label: "👕 Cloths & Fabrics",
      bg: "#EEF2FF",
      color: "#4F46E5",
    },
    { name: "fashion", label: "👗 Fashion", bg: "#FDF2F8", color: "#DB2777" },
    {
      name: "electronics",
      label: "📱 Electronics",
      bg: "#EFF6FF",
      color: "#2563EB",
    },
    { name: "tools", label: "🔧 Tools", bg: "#FEF3C7", color: "#D97706" },
    { name: "beauty", label: "💄 Beauty", bg: "#F3E8FF", color: "#9333EA" },
  ];

  return (
    <div style={{ paddingBottom: "50px" }}>
      {/* Hero Banner */}
      <div className="hero-banner">
        <h1 className="hero-title">🛍️ Welcome to Kotla Store</h1>
        <p className="hero-subtitle">
          Best prices on local products | Fast delivery | Secure Cash on
          Delivery
        </p>
      </div>

      {searchQuery && (
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto 20px auto",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "14px", color: "#64748B" }}>
            Showing results for: <strong>{searchQuery}</strong>
          </span>
          <button
            onClick={() => setSearchQuery && setSearchQuery("")}
            style={{
              background: "#E2E8F0",
              border: "none",
              padding: "5px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              color: "#334155",
            }}
          >
            Clear Search ✕
          </button>
        </div>
      )}

      {/* Categories Filter Bar */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 25px auto",
          padding: "0 20px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            color: "#1E293B",
            marginBottom: "12px",
            fontWeight: "bold",
          }}
        >
          Shop by Category
        </h2>
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "5px",
          }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  padding: "10px 18px",
                  backgroundColor: isActive ? "#2563EB" : cat.bg,
                  color: isActive ? "#FFFFFF" : cat.color,
                  border: isActive ? "1px solid #2563EB" : "1px solid #E2E8F0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(37, 99, 235, 0.2)"
                    : "none",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Section */}
      <div
        className="products-section"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
      >
        <h2
          className="section-title"
          style={{
            fontSize: "18px",
            color: "#1E293B",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          {searchQuery
            ? `Search Results`
            : selectedCategory !== "All"
            ? `${selectedCategory.toUpperCase()} Products`
            : "Featured Products"}{" "}
          {!loading && `(${filteredProducts.length})`}
        </h2>

        {loading ? (
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="product-card"
                style={{ pointerEvents: "none" }}
              >
                <div
                  style={{
                    height: "180px",
                    backgroundColor: "#E2E8F0",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                <div style={{ padding: "15px" }}>
                  <div
                    style={{
                      height: "16px",
                      backgroundColor: "#E2E8F0",
                      borderRadius: "4px",
                      marginBottom: "10px",
                      width: "80%",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  <div
                    style={{
                      height: "14px",
                      backgroundColor: "#E2E8F0",
                      borderRadius: "4px",
                      width: "40%",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className="empty-state"
            style={{
              textAlign: "center",
              padding: "60px 0",
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>📭</div>
            <p style={{ color: "#64748B", fontSize: "15px", margin: 0 }}>
              No products found in this category.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                className="product-card"
                onClick={() => setSelectedProduct(product)}
              >
                <div
                  className="product-image"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "180px",
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <img
                    src={
                      product.image && product.image.trim() !== ""
                        ? product.image
                        : DEFAULT_PRODUCT_IMAGE
                    }
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {product.discount > 0 && (
                    <div className="product-discount-badge">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>

                  <div className="product-price-box">
                    {product.originalPrice && (
                      <span className="product-original-price">
                        ₨{product.originalPrice}
                      </span>
                    )}
                    <span className="product-current-price">
                      ₨{product.currentPrice}
                    </span>
                  </div>

                  <div
                    className={`product-stock ${
                      product.stock > 0 ? "in-stock" : "out-stock"
                    }`}
                  >
                    📦{" "}
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onShowToast={onShowToast}
        onDirectCheckout={onDirectCheckout}
        user={user}
        onOpenLoginModal={onOpenLoginModal}
      />
    </div>
  );
}
