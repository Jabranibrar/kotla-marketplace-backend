import React, { useState } from "react";
import { addProduct } from "../api";
import "../styles/main.css";

export default function AddProductPage({ user, onShowToast, onBack }) {
  const [form, setForm] = useState({
    name: "",
    originalPrice: "",
    currentPrice: "",
    stock: "",
    category: "electronics",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.originalPrice ||
      !form.currentPrice ||
      !form.stock
    ) {
      onShowToast("Please fill all required fields", "warning");
      return;
    }

    if (!user?._id) {
      onShowToast("Seller information missing. Please login again.", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await addProduct({
        sellerId: user._id,
        name: form.name,
        originalPrice: parseFloat(form.originalPrice),
        currentPrice: parseFloat(form.currentPrice),
        stock: parseInt(form.stock),
        category: form.category,
      });

      onShowToast(
        `✅ Product "${form.name}" added successfully! Discount: ${response.data.discount}%`,
        "success"
      );
      setForm({
        name: "",
        originalPrice: "",
        currentPrice: "",
        stock: "",
        category: "electronics",
      });
      setTimeout(onBack, 1200);
    } catch (error) {
      onShowToast(
        "Error adding product: " +
          (error.response?.data?.error || error.message),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: "20px",
          backgroundColor: "transparent",
          border: "none",
          color: "#2563EB",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "15px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        ← Back to Dashboard
      </button>

      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          padding: "35px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            marginBottom: "25px",
            borderBottom: "1px solid #F1F5F9",
            paddingBottom: "15px",
          }}
        >
          <h1 style={{ color: "#1E293B", margin: 0, fontSize: "24px" }}>
            ➕ Add New Product
          </h1>
          <p
            style={{ color: "#64748B", margin: "5px 0 0 0", fontSize: "14px" }}
          >
            Posting as Seller:{" "}
            <strong style={{ color: "#0F172A" }}>
              {user?.name || "Authorized Seller"}
            </strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label
              className="form-label"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "6px",
              }}
            >
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g., Apple iPhone 14 Pro Max"
              value={form.name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div className="form-group">
              <label
                className="form-label"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Original Price (₨) *
              </label>
              <input
                type="number"
                name="originalPrice"
                className="form-input"
                placeholder="150000"
                value={form.originalPrice}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div className="form-group">
              <label
                className="form-label"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Sale Price (₨) *
              </label>
              <input
                type="number"
                name="currentPrice"
                className="form-input"
                placeholder="130000"
                value={form.currentPrice}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {form.originalPrice &&
            form.currentPrice &&
            form.originalPrice > form.currentPrice && (
              <div
                style={{
                  backgroundColor: "#F0FDF4",
                  border: "1px solid #DCFCE7",
                  color: "#166534",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  marginBottom: "20px",
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Calculated Discount:</span>
                <strong style={{ fontSize: "16px" }}>
                  {Math.round(
                    ((form.originalPrice - form.currentPrice) /
                      form.originalPrice) *
                      100
                  )}
                  % OFF
                </strong>
              </div>
            )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "25px",
            }}
          >
            <div className="form-group">
              <label
                className="form-label"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                className="form-input"
                placeholder="15"
                value={form.stock}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div className="form-group">
              <label
                className="form-label"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Category *
              </label>
              <select
                name="category"
                className="form-input"
                value={form.category}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  fontSize: "14px",
                  backgroundColor: "#FFF",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="electronics">📱 Electronics</option>
                <option value="fashion">👔 Fashion</option>
                <option value="tools">🔧 Tools</option>
                <option value="beauty">💄 Beauty</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#2563EB",
              color: "#FFF",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "16px",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Saving Product to Database..." : "🚀 Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
