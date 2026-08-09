import React, { useEffect, useState } from "react";
import { addProduct, updateProduct } from "../api";
import "../styles/addProductPage.css";

const INITIAL_FORM = {
  name: "",
  originalPrice: "",
  currentPrice: "",
  stock: "",
  category: "electronics",
};

export default function AddProductPage({
  user,
  onShowToast,
  onBack,
  editProductData = null,
  onSuccess,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(editProductData);

  useEffect(() => {
    if (editProductData) {
      setForm({
        name: editProductData.name || "",
        originalPrice: editProductData.originalPrice ?? "",
        currentPrice: editProductData.currentPrice ?? "",
        stock: editProductData.stock ?? "",
        category: editProductData.category || "electronics",
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [editProductData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const showToast = (message, type) => {
    if (typeof onShowToast === "function") {
      onShowToast(message, type);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      form.originalPrice === "" ||
      form.currentPrice === "" ||
      form.stock === ""
    ) {
      showToast("Please fill all required fields.", "warning");
      return;
    }

    const currentUserId = user?._id || user?.id;

    if (!currentUserId) {
      showToast("Seller information missing. Please login again.", "error");
      return;
    }

    const originalPrice = Number(form.originalPrice);
    const currentPrice = Number(form.currentPrice);
    const stock = Number(form.stock);

    if (originalPrice <= 0 || currentPrice <= 0) {
      showToast("Prices must be greater than 0.", "warning");
      return;
    }

    if (stock < 0) {
      showToast("Stock cannot be negative.", "warning");
      return;
    }

    if (currentPrice > originalPrice) {
      showToast(
        "Sale price cannot be greater than the original price.",
        "warning"
      );
      return;
    }

    setLoading(true);

    try {
      const productId = editProductData?._id || editProductData?.id;

      const productData = {
        sellerId: currentUserId,
        name: form.name.trim(),
        originalPrice,
        currentPrice,
        stock: parseInt(stock, 10),
        category: form.category,
      };

      let response;

      if (isEditMode && productId) {
        response = await updateProduct(productId, productData);

        showToast(`Product "${form.name}" updated successfully.`, "success");
      } else {
        response = await addProduct(productData);

        const discount =
          response?.data?.discount ??
          Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

        showToast(
          `Product "${form.name}" added successfully! Discount: ${discount}%`,
          "success"
        );
      }

      setForm(INITIAL_FORM);

      if (typeof onSuccess === "function") {
        onSuccess(response?.data);
      } else if (typeof onBack === "function") {
        setTimeout(onBack, 500);
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        `Failed to ${isEditMode ? "update" : "add"} product.`;

      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const discount =
    form.originalPrice &&
    form.currentPrice &&
    Number(form.originalPrice) > Number(form.currentPrice)
      ? Math.round(
          ((Number(form.originalPrice) - Number(form.currentPrice)) /
            Number(form.originalPrice)) *
            100
        )
      : 0;

  return (
    <div className="kotla-add-page">
      <div className="kotla-add-container">
        <button type="button" className="kotla-back-button" onClick={onBack}>
          ← Back to Dashboard
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>

            <div>
              <span className="kotla-add-eyebrow">
                {isEditMode ? "Product Management" : "Seller Center"}
              </span>

              <h1>{isEditMode ? "Edit Product" : "Publish New Product"}</h1>

              <p>
                {isEditMode
                  ? "Update your product information and save the latest changes."
                  : "Posting as Seller: "}
                {!isEditMode && (
                  <strong>{user?.name || "Authorized Seller"}</strong>
                )}
              </p>
            </div>
          </div>

          <form className="kotla-product-form" onSubmit={handleSubmit}>
            <div className="kotla-form-group">
              <label htmlFor="product-name">Product Name *</label>

              <input
                id="product-name"
                type="text"
                name="name"
                placeholder="e.g. Apple iPhone 14 Pro Max"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="kotla-form-row">
              <div className="kotla-form-group">
                <label htmlFor="original-price">Original Price (₨) *</label>

                <input
                  id="original-price"
                  type="number"
                  name="originalPrice"
                  min="0"
                  step="0.01"
                  placeholder="150000"
                  value={form.originalPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="kotla-form-group">
                <label htmlFor="current-price">Sale Price (₨) *</label>

                <input
                  id="current-price"
                  type="number"
                  name="currentPrice"
                  min="0"
                  step="0.01"
                  placeholder="130000"
                  value={form.currentPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {discount > 0 && (
              <div className="kotla-discount-badge-box">
                <span>Calculated Discount</span>
                <strong>{discount}% OFF</strong>
              </div>
            )}

            <div className="kotla-form-row">
              <div className="kotla-form-group">
                <label htmlFor="stock">Stock Quantity *</label>

                <input
                  id="stock"
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  placeholder="15"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="kotla-form-group">
                <label htmlFor="category">Category *</label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
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
                isEditMode ? (
                  "Updating Product..."
                ) : (
                  "Saving Product..."
                )
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>

                  {isEditMode ? "Save Product Changes" : "Publish Product"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
