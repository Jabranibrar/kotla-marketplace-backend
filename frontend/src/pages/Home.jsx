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

  // ---------------------------------------------------------
  // FETCH PRODUCTS
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // CATEGORIES
  // ---------------------------------------------------------

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
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
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
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 3h8l1.5 4L21 9l-2 4-3-1v9H8v-9l-3 1-2-4 3.5-2L8 3Z" />
          <path d="M9 3c.4 2 1.4 3 3 3s2.6-1 3-3" />
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
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 3h12" />
          <path d="M9 3v4l-4 3v10h14V10l-4-3V3" />
          <path d="M9 7h6" />
          <path d="M8 20v-5h8v5" />
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
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M8 8h8" />
          <path d="M8 12h5" />
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
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6a2 2 0 0 0 2.8 2.8l6-6a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.8-2.8 2.3-2.3Z" />
          <path d="m16 4 4 4" />
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
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 3h6" />
          <path d="M10 3v4l-2 3v10h8V10l-2-3V3" />
          <path d="M8 13h8" />
          <path d="M10 17h4" />
        </svg>
      ),
    },
  ];

  // ---------------------------------------------------------
  // FILTER PRODUCTS
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // PRODUCTS HEADING
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // PRODUCT KEYBOARD ACCESSIBILITY
  // ---------------------------------------------------------

  const handleProductKeyDown = (event, product) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedProduct(product);
    }
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div className="home-page">
      {/* ---------------------------------------------------
          HERO
      --------------------------------------------------- */}

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

        <h1 className="hero-title">
          Welcome to Kotla <span>Market</span>
        </h1>

        <p className="hero-subtitle">
          Shop local products from trusted sellers with competitive prices,
          convenient delivery and secure Cash on Delivery.
        </p>
      </div>

      {/* ---------------------------------------------------
          SEARCH RESULT BAR
      --------------------------------------------------- */}

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

      {/* ---------------------------------------------------
          MARKETPLACE AREA
      --------------------------------------------------- */}

      <div className="kotla-marketplace-layout">
        {/* -------------------------------------------------
            LEFT CATEGORY SIDEBAR
        ------------------------------------------------- */}

        <aside className="kotla-category-sidebar">
          <div className="kotla-category-sidebar-header">
            <span className="kotla-section-eyebrow">Browse</span>

            <h2>Categories</h2>
          </div>

          <div className="kotla-category-sidebar-list">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;

              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`kotla-sidebar-category ${
                    isActive ? "active" : ""
                  }`}
                  style={{
                    "--category-color": cat.color,
                    "--category-bg": cat.bg,
                  }}
                  aria-pressed={isActive}
                >
                  <span className="kotla-sidebar-category-icon">
                    {cat.icon}
                  </span>

                  <span className="kotla-sidebar-category-name">
                    {cat.label}
                  </span>

                  {isActive && (
                    <span className="kotla-sidebar-category-arrow">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedCategory !== "All" && (
            <button
              type="button"
              className="kotla-sidebar-view-all"
              onClick={() => setSelectedCategory("All")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12h18" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              View All Products
            </button>
          )}
        </aside>

        {/* -------------------------------------------------
            PRODUCTS CONTENT
        ------------------------------------------------- */}

        <section className="kotla-products-area">
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

            {/* -------------------------------------------------
                LOADING
            ------------------------------------------------- */}

            {loading ? (
              <div
                className={
                  viewMode === "list" ? "products-list" : "products-grid"
                }
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
              /* -------------------------------------------------
                  EMPTY STATE
              ------------------------------------------------- */

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
              /* -------------------------------------------------
                  PRODUCTS
              ------------------------------------------------- */

              <div
                className={
                  viewMode === "list" ? "products-list" : "products-grid"
                }
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

                      {/* <div className="kotla-list-product-action">
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
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------
          PRODUCT DETAIL MODAL
      --------------------------------------------------- */}

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
