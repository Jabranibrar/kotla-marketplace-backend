import React, { useEffect, useState } from "react";
import { getProducts, getProductsBySeller, deleteProduct } from "../api";
import AddProduct from "../components/AddProduct";
import "../styles/sellerDashboard.css";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";

export default function SellerDashboard({ user, onShowToast }) {
  const [activeTab, setActiveTab] = useState("products");
  const [sellerProducts, setSellerProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async () => {
    const currentUserId = user?._id || user?.id;

    if (!currentUserId) {
      setSellerProducts([]);
      return;
    }

    setLoading(true);

    try {
      const res = await getProductsBySeller(currentUserId);

      const filteredProducts = (res.data || []).filter((product) => {
        const sellerId =
          typeof product.sellerId === "object"
            ? product.sellerId?._id || product.sellerId?.id
            : product.sellerId;

        return String(sellerId) === String(currentUserId);
      });

      setSellerProducts(filteredProducts);
    } catch (error) {
      try {
        const allRes = await getProducts();

        const filteredProducts = (allRes.data || []).filter((product) => {
          const sellerId =
            typeof product.sellerId === "object"
              ? product.sellerId?._id || product.sellerId?.id
              : product.sellerId;

          return String(sellerId) === String(currentUserId);
        });

        setSellerProducts(filteredProducts);
      } catch (fallbackError) {
        setSellerProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const handleToggleProductView = () => {
    setEditingProduct(null);
    setActiveTab((current) =>
      current === "add-product" ? "products" : "add-product"
    );
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setActiveTab("add-product");
  };

  const confirmDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;

    const rawId = productToDelete._id || productToDelete.id;
    const productId = typeof rawId === "object" ? rawId._id || rawId.id : rawId;

    if (!productId) {
      if (onShowToast) onShowToast("Invalid product ID", "error");
      closeDeleteModal();
      return;
    }

    try {
      await deleteProduct(String(productId).trim());

      setSellerProducts((previousProducts) =>
        previousProducts.filter(
          (product) => String(product._id || product.id) !== String(productId)
        )
      );

      if (onShowToast) {
        onShowToast("Product deleted successfully", "success");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      if (onShowToast) {
        onShowToast("Failed to delete product", "error");
      }
    } finally {
      closeDeleteModal();
    }
  };

  const handleAddProductSuccess = () => {
    setEditingProduct(null);
    setActiveTab("products");
    fetchProducts();
  };

  return (
    <div className="seller-dashboard">
      <div className="seller-dashboard-container">
        <header className="seller-dashboard-header">
          <div className="seller-dashboard-heading">
            <span className="seller-dashboard-eyebrow">Seller Center</span>

            <h1>{user?.shopName || "Seller Dashboard"}</h1>

            <p>
              Manage your inventory, update products and keep your storefront up
              to date.
            </p>
          </div>

          <button
            type="button"
            className={`seller-dashboard-primary-btn ${
              activeTab === "add-product"
                ? "seller-dashboard-primary-btn--secondary"
                : ""
            }`}
            onClick={handleToggleProductView}
          >
            <span>
              {activeTab === "add-product" ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              )}
            </span>

            {activeTab === "add-product" ? "View Products" : "Add New Product"}
          </button>
        </header>

        {activeTab === "add-product" ? (
          <section className="seller-dashboard-content">
            <AddProduct
              user={user}
              onShowToast={onShowToast}
              editProductData={editingProduct}
              onSuccess={handleAddProductSuccess}
            />
          </section>
        ) : (
          <section className="seller-dashboard-content">
            <div className="seller-inventory-header">
              <div>
                <h2>My Products</h2>
                <p>
                  {sellerProducts.length}{" "}
                  {sellerProducts.length === 1 ? "product" : "products"} in your
                  inventory
                </p>
              </div>
            </div>

            {loading ? (
              <div className="seller-dashboard-state">
                <div className="seller-loading-spinner" />
                <h3>Loading inventory</h3>
                <p>Fetching your latest products...</p>
              </div>
            ) : sellerProducts.length > 0 ? (
              <div className="seller-products-grid">
                {sellerProducts.map((product) => (
                  <article
                    key={product._id || product.id}
                    className="seller-product-card"
                  >
                    <div className="seller-product-image-wrapper">
                      <img
                        src={
                          product.image && product.image.trim() !== ""
                            ? product.image
                            : DEFAULT_PRODUCT_IMAGE
                        }
                        alt={product.name}
                        className="seller-product-image"
                      />

                      <span className="seller-product-category">
                        {product.category || "General"}
                      </span>
                    </div>

                    <div className="seller-product-content">
                      <h3 title={product.name}>{product.name}</h3>

                      <div className="seller-product-price-row">
                        <span className="seller-product-price">
                          ₨ {product.currentPrice}
                        </span>

                        {product.originalPrice && (
                          <span className="seller-product-original-price">
                            ₨ {product.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="seller-product-meta">
                        <span>
                          Stock <strong>{product.stock ?? 0}</strong>
                        </span>

                        <span className="seller-product-meta-divider" />

                        <span>
                          {product.stock > 0 ? "Available" : "Out of stock"}
                        </span>
                      </div>
                    </div>

                    <div className="seller-product-actions">
                      <button
                        type="button"
                        className="seller-product-edit-btn"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="seller-product-delete-btn"
                        onClick={() => confirmDeleteClick(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="seller-dashboard-empty">
                <div className="seller-empty-icon">+</div>

                <span className="seller-dashboard-eyebrow">Inventory</span>

                <h2>Your inventory is empty</h2>

                <p>
                  Add your first product and start building your storefront on
                  Kotla Marketplace.
                </p>

                <button
                  type="button"
                  className="seller-dashboard-primary-btn"
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveTab("add-product");
                  }}
                >
                  + Add Your First Product
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {deleteModalOpen && (
        <div className="seller-delete-overlay" onClick={closeDeleteModal}>
          <div
            className="seller-delete-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
          >
            <div className="seller-delete-icon">!</div>

            <h2 id="delete-product-title">Delete Product?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>"{productToDelete?.name}"</strong> from your store? This
              action cannot be undone.
            </p>

            <div className="seller-delete-actions">
              <button
                type="button"
                className="seller-delete-cancel-btn"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="seller-delete-confirm-btn"
                onClick={executeDelete}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
