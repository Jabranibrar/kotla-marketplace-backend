import React, { useState } from "react";
import { addProduct } from "../api";
import "../styles/addProductPage.css";

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
        `Product "${form.name}" added successfully! Discount: ${response.data.discount}%`,
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
    <div className="kotla-add-page-wrapper">
      <button onClick={onBack} className="kotla-back-btn">
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Dashboard
      </button>

      <div className="kotla-add-card">
        <div className="kotla-add-header">
          <div className="kotla-add-header-icon">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <div>
            <h1>Publish New Product</h1>
            <p>
              Posting as Seller:{" "}
              <strong>{user?.name || "Authorized Seller"}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="kotla-form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Apple iPhone 14 Pro Max"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="kotla-form-row">
            <div className="kotla-form-group" style={{ marginBottom: 0 }}>
              <label>Original Price (₨) *</label>
              <input
                type="number"
                name="originalPrice"
                placeholder="150000"
                value={form.originalPrice}
                onChange={handleChange}
              />
            </div>

            <div className="kotla-form-group" style={{ marginBottom: 0 }}>
              <label>Sale Price (₨) *</label>
              <input
                type="number"
                name="currentPrice"
                placeholder="130000"
                value={form.currentPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          {form.originalPrice &&
            form.currentPrice &&
            form.originalPrice > form.currentPrice && (
              <div className="kotla-discount-badge-box">
                <span>Calculated Discount:</span>
                <strong>
                  {Math.round(
                    ((form.originalPrice - form.currentPrice) /
                      form.originalPrice) *
                      100
                  )}
                  % OFF
                </strong>
              </div>
            )}

          <div className="kotla-form-row">
            <div className="kotla-form-group" style={{ marginBottom: 0 }}>
              <label>Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                placeholder="15"
                value={form.stock}
                onChange={handleChange}
              />
            </div>

            <div className="kotla-form-group" style={{ marginBottom: 0 }}>
              <label>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="electronics">Electronics & Tech</option>
                <option value="fashion">Fashion & Apparel</option>
                <option value="tools">Tools & Hardware</option>
                <option value="beauty">Beauty & Care</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="kotla-submit-action-btn"
          >
            {loading ? (
              "Saving Product to Database..."
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Publish Product
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
