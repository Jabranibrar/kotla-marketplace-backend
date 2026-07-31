import React, { useState, useEffect } from "react";
import AddProduct from "./AddProduct";
import { getProductsBySeller, deleteProduct, getProducts } from "../api";

// Professional Default Product Image Fallback
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
    setLoading(true);
    try {
      const currentUserId = user?._id || user?.id;
      const res = await getProductsBySeller(currentUserId);

      // Strict filtering taake sirf isi seller ke products aayein
      const filteredProducts = (res.data || []).filter((p) => {
        const pSellerId =
          typeof p.sellerId === "object"
            ? p.sellerId?._id || p.sellerId?.id
            : p.sellerId;
        return String(pSellerId) === String(currentUserId);
      });

      setSellerProducts(filteredProducts);
    } catch (err) {
      try {
        const allRes = await getProducts();
        const currentUserId = user?._id || user?.id;

        const filtered = (allRes.data || []).filter((p) => {
          const pSellerId =
            typeof p.sellerId === "object"
              ? p.sellerId?._id || p.sellerId?.id
              : p.sellerId;
          return String(pSellerId) === String(currentUserId);
        });
        setSellerProducts(filtered);
      } catch (fallbackErr) {
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

  const confirmDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    const productId = productToDelete._id || productToDelete.id;

    try {
      await deleteProduct(productId);
      setSellerProducts((prev) =>
        prev.filter((p) => (p._id || p.id) !== productId)
      );
      if (onShowToast)
        onShowToast("🗑️ Product deleted successfully", "success");
    } catch (err) {
      if (onShowToast) onShowToast("❌ Failed to delete product", "error");
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setActiveTab("add-product");
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px" }}>
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          padding: "20px 25px",
          marginBottom: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: "#1E293B",
              margin: "0 0 5px 0",
            }}
          >
            🏪 {user?.shopName || "Seller Dashboard"}
          </h2>
          <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
            Manage your store inventory, upload item pictures, update prices, or
            remove items.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === "add-product") {
              setEditingProduct(null);
              setActiveTab("products");
            } else {
              setEditingProduct(null);
              setActiveTab("add-product");
            }
          }}
          style={{
            padding: "10px 18px",
            backgroundColor:
              activeTab === "add-product" ? "#475569" : "#2563EB",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
          }}
        >
          {activeTab === "add-product"
            ? "📦 View Products"
            : "➕ Add New Product"}
        </button>
      </div>

      {activeTab === "add-product" ? (
        <AddProduct
          user={user}
          onShowToast={onShowToast}
          editProductData={editingProduct}
          onSuccess={() => {
            setEditingProduct(null);
            setActiveTab("products");
            fetchProducts();
          }}
        />
      ) : (
        <div>
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#64748B" }}
            >
              Loading inventory...
            </div>
          ) : sellerProducts.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              {sellerProducts.map((prod) => (
                <div
                  key={prod._id || prod.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    padding: "16px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* ✨ Professional Image Render with Fallback */}
                    <img
                      src={
                        prod.image && prod.image.trim() !== ""
                          ? prod.image
                          : DEFAULT_PRODUCT_IMAGE
                      }
                      alt={prod.name}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        marginBottom: "12px",
                        border: "1px solid #F1F5F9",
                        backgroundColor: "#F8FAFC",
                      }}
                    />

                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#1E293B",
                        margin: "0 0 6px 0",
                      }}
                    >
                      {prod.name}
                    </h4>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#2563EB",
                        fontWeight: "600",
                        margin: "0 0 6px 0",
                      }}
                    >
                      ₨ {prod.currentPrice}{" "}
                      <span
                        style={{
                          textDecoration: "line-through",
                          color: "#94A3B8",
                          fontSize: "12px",
                        }}
                      >
                        ₨ {prod.originalPrice}
                      </span>
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748B",
                        margin: "0 0 15px 0",
                      }}
                    >
                      Stock: <b>{prod.stock}</b> | Category:{" "}
                      <b>{prod.category}</b>
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleEdit(prod)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        backgroundColor: "#EFF6FF",
                        color: "#2563EB",
                        border: "1px solid #BFDBFE",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => confirmDeleteClick(prod)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        backgroundColor: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "50px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📦</div>
              <h3
                style={{
                  fontSize: "18px",
                  color: "#1E293B",
                  marginBottom: "8px",
                }}
              >
                Your Inventory is Empty
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#64748B",
                  marginBottom: "20px",
                }}
              >
                You haven't added any products to your store yet. Click below to
                start selling!
              </p>
              <button
                onClick={() => setActiveTab("add-product")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2563EB",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      )}

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
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "25px 30px",
              borderRadius: "12px",
              maxWidth: "400px",
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
              Delete Product?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#64748B",
                marginBottom: "20px",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to delete{" "}
              <b style={{ color: "#0F172A" }}>"{productToDelete?.name}"</b> from
              your store inventory? This action cannot be undone.
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
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
