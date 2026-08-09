import React, { useEffect, useState } from "react";
import { getProducts } from "../api";
import ProductDetailModal from "../components/ProductDetailModal";
import "../styles/main.css";
import "../styles/home.css";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";

export default function Home({
  searchQuery,
  setSearchQuery,
  onShowToast,
  onDirectCheckout,
  user,
  onOpenLoginModal,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await getProducts();

        setProducts(response.data || []);
      } catch (error) {
        console.error("Error loading products:", error);

        if (typeof onShowToast === "function") {
          onShowToast("Error loading products", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [onShowToast]);

  const filteredProducts = products.filter((product) => {
    const productName = String(product.name || "").toLowerCase();
    const currentSearch = String(searchQuery || "").toLowerCase();

    const matchesSearch = productName.includes(currentSearch);

    const matchesCategory =
      selectedCategory === "All" ||
      String(product.category || "").toLowerCase() ===
        selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const categories = [
    {
      name: "All",
      label: "All Products",
      bg: "#F8FAFC",
      color: "#334155",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      name: "cloths",
      label: "Cloths & Fabrics",
      bg: "#EEF2FF",
      color: "#4F46E5",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M20.4 4.8 16 3a4.5 4.5 0 0 1-8 0L3.6 4.8a2 2 0 0 0-1.2 2.1l.5 3.1H6v10h12V10h3.1l.5-3.1a2 2 0 0 0-1.2-2.1Z" />
          <path d="M8 3c.5 1.5 1.8 2.5 4 2.5S15.5 4.5 16 3" />
        </svg>
      ),
    },
    {
      name: "fashion",
      label: "Fashion",
      bg: "#FDF2F8",
      color: "#DB2777",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M8 3h8l1.5 3.5L21 8l-2 4-2-1v10H7V11l-2 1-2-4 3.5-1.5L8 3Z" />
          <path d="M8 3c.5 2 1.8 3 4 3s3.5-1 4-3" />
        </svg>
      ),
    },
    {
      name: "electronics",
      label: "Electronics",
      bg: "#EFF6FF",
      color: "#2563EB",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="6" y="2.5" width="12" height="19" rx="2" />
          <path d="M10 5h4" />
          <path d="M11 18.5h2" />
        </svg>
      ),
    },
    {
      name: "tools",
      label: "Tools & Hardware",
      bg: "#FFFBEB",
      color: "#D97706",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M14.7 6.3a4.5 4.5 0 0 0 5.9 5.9l-8.1 8.1a2.1 2.1 0 0 1-3-3l8.1-8.1a4.5 4.5 0 0 0-5.9-5.9l3 3-2.8 2.8-3-3a4.5 4.5 0 0 0 5.8-.8Z" />
        </svg>
      ),
    },
    {
      name: "beauty",
      label: "Beauty & Care",
      bg: "#FAF5FF",
      color: "#9333EA",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M7 8h10v13H7z" />
          <path d="M9 8V5a3 3 0 0 1 6 0v3" />
          <path d="M5 8h14" />
          <path d="M10 12h4" />
        </svg>
      ),
    },
  ];

  const getProductsHeading = () => {
    if (searchQuery) {
      return "Search Results";
    }

    if (selectedCategory !== "All") {
      const selected = categories.find(
        (category) => category.name === selectedCategory
      );

      return selected ? selected.label : "Products";
    }

    return "Featured Products";
  };

  const handleProductKeyDown = (event, product) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedProduct(product);
    }
  };

  return (
    <div className="kotla-home-page">
      <div className="hero-banner">
        <div className="hero-icon">
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

        <h1 className="hero-title">Welcome to Kotla Store</h1>

        <p className="hero-subtitle">
          Shop local products from trusted sellers with competitive prices,
          convenient delivery and secure Cash on Delivery.
        </p>
      </div>

      {searchQuery && (
        <div className="kotla-search-result-bar">
          <div className="kotla-search-result-info">
            <span className="kotla-search-result-label">
              Search results for
            </span>

            <strong className="kotla-search-query">“{searchQuery}”</strong>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof setSearchQuery === "function") {
                setSearchQuery("");
              }
            }}
            className="kotla-clear-search-btn"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
            Clear Search
          </button>
        </div>
      )}

      <div className="kotla-categories-wrapper">
        <div className="kotla-categories-header">
          <div>
            <span className="kotla-section-eyebrow">Browse</span>
            <h2 className="kotla-categories-title">Shop by Category</h2>
          </div>

          {selectedCategory !== "All" && (
            <button
              type="button"
              className="kotla-reset-category-btn"
              onClick={() => setSelectedCategory("All")}
            >
              View All
            </button>
          )}
        </div>

        <div className="kotla-categories-list">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`category-card ${isActive ? "active" : ""}`}
                style={{
                  "--category-color": cat.color,
                  "--category-bg": cat.bg,
                }}
                aria-pressed={isActive}
              >
                <span className="category-icon">{cat.icon}</span>

                <span className="category-label">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="products-section kotla-products-section">
        <div className="kotla-products-header">
          <div>
            <span className="kotla-section-eyebrow">Marketplace</span>

            <h2 className="section-title">{getProductsHeading()}</h2>
          </div>

          <div className="kotla-products-toolbar">
            {!loading && (
              <span className="kotla-products-count">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "Product" : "Products"}
              </span>
            )}

            <div
              className="kotla-view-switcher"
              role="group"
              aria-label="Product view"
            >
              <button
                type="button"
                className={`kotla-view-btn ${
                  viewMode === "grid" ? "active" : ""
                }`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>

                <span>Grid</span>
              </button>

              <button
                type="button"
                className={`kotla-view-btn ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="4" y="5" width="16" height="3" rx="1" />
                  <rect x="4" y="10.5" width="16" height="3" rx="1" />
                  <rect x="4" y="16" width="16" height="3" rx="1" />
                </svg>

                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div
            className={viewMode === "list" ? "products-list" : "products-grid"}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="product-card kotla-product-skeleton">
                <div className="kotla-skeleton-image" />

                <div className="kotla-skeleton-content">
                  <div className="kotla-skeleton-title" />
                  <div className="kotla-skeleton-price" />
                  <div className="kotla-skeleton-stock" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state kotla-empty-state">
            <div className="kotla-empty-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <path d="M4 7h16l-1 13H5L4 7Z" />
                <path d="M8 7a4 4 0 0 1 8 0" />
                <path d="M9 12h6" />
              </svg>
            </div>

            <h3 className="kotla-empty-title">No products found</h3>

            <p className="kotla-empty-text">
              We couldn't find any products matching your current search or
              category.
            </p>

            {(searchQuery || selectedCategory !== "All") && (
              <button
                type="button"
                className="kotla-empty-reset-btn"
                onClick={() => {
                  setSelectedCategory("All");

                  if (typeof setSearchQuery === "function") {
                    setSearchQuery("");
                  }
                }}
              >
                Browse All Products
              </button>
            )}
          </div>
        ) : (
          <div
            className={viewMode === "list" ? "products-list" : "products-grid"}
          >
            {filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                className="product-card"
                onClick={() => setSelectedProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => handleProductKeyDown(event, product)}
              >
                <div className="product-image kotla-product-image">
                  <img
                    src={
                      product.image && product.image.trim() !== ""
                        ? product.image
                        : DEFAULT_PRODUCT_IMAGE
                    }
                    alt={product.name || "Product"}
                    loading="lazy"
                  />

                  {product.discount > 0 && (
                    <div className="product-discount-badge">
                      -{product.discount}%
                    </div>
                  )}

                  <div className="kotla-product-image-overlay">
                    <span>View Details</span>
                  </div>
                </div>

                <div className="product-info">
                  <div className="kotla-product-category">
                    {String(product.category || "Marketplace").replace(
                      /^./,
                      (letter) => letter.toUpperCase()
                    )}
                  </div>

                  <h3 className="product-name">{product.name}</h3>

                  <div className="product-price-box">
                    {product.originalPrice && (
                      <span className="product-original-price">
                        ₨{Number(product.originalPrice).toLocaleString()}
                      </span>
                    )}

                    <span className="product-current-price">
                      ₨{Number(product.currentPrice || 0).toLocaleString()}
                    </span>
                  </div>

                  <div
                    className={`product-stock ${
                      product.stock > 0 ? "in-stock" : "out-stock"
                    }`}
                  >
                    <span className="kotla-stock-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path d="M3 7h13v10H3z" />
                        <path d="M16 10h3l2 3v4h-5z" />
                        <circle cx="7" cy="19" r="1.5" />
                        <circle cx="18" cy="19" r="1.5" />
                      </svg>
                    </span>

                    <span>
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  <div className="kotla-list-product-action">
                    <span>View Product</span>

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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
