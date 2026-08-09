import React, { useEffect, useState } from "react";
import { addProduct, updateProduct } from "../api";
import "../styles/addProduct.css";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";

const CATEGORY_DESCRIPTIONS = {
  cloths:
    "Premium quality clothing crafted with comfortable fabric, modern style, and perfect fit for everyday elegance.",
  fashion:
    "Latest fashion wear and trendy apparel designed with fine stitching and superior quality.",
  electronics:
    "High-performance electronic device with advanced features and guaranteed durability.",
  tools:
    "Heavy-duty professional grade tool built for efficiency and long-lasting performance.",
  beauty:
    "Top-tier premium beauty and personal care product designed for safe, flawless results.",
};

const EMPTY_FORM = {
  name: "",
  originalPrice: "",
  currentPrice: "",
  stock: "",
  category: "cloths",
  image: "",
  description: "",
};

export default function AddProduct({
  user,
  onShowToast,
  onSuccess,
  editProductData,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (editProductData) {
      setForm({
        name: editProductData.name ?? "",
        originalPrice: editProductData.originalPrice ?? "",
        currentPrice: editProductData.currentPrice ?? "",
        stock: editProductData.stock ?? "",
        category: editProductData.category ?? "cloths",
        image: editProductData.image ?? "",
        description: editProductData.description ?? "",
      });

      return;
    }

    setForm(EMPTY_FORM);
  }, [editProductData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onShowToast?.("Please select a valid image file.", "error");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((previousForm) => ({
        ...previousForm,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();

    setForm((previousForm) => ({
      ...previousForm,
      image: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const sellerId = user?._id || user?.id;

    if (!sellerId) {
      onShowToast?.("Please login as a seller first.", "error");
      return;
    }

    const name = form.name.trim();
    const originalPrice = Number(form.originalPrice);
    const currentPrice = Number(form.currentPrice);
    const stock = Number(form.stock);

    if (!name) {
      onShowToast?.("Please enter a product name.", "warning");
      return;
    }

    if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
      onShowToast?.("Please enter a valid original price.", "warning");
      return;
    }

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      onShowToast?.("Please enter a valid sale price.", "warning");
      return;
    }

    if (currentPrice > originalPrice) {
      onShowToast?.(
        "Sale price cannot be higher than the original price.",
        "warning"
      );
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      onShowToast?.("Please enter a valid stock quantity.", "warning");
      return;
    }

    const finalImage =
      form.image && form.image.trim() !== ""
        ? form.image
        : DEFAULT_PRODUCT_IMAGE;

    const finalDescription =
      form.description && form.description.trim() !== ""
        ? form.description.trim()
        : CATEGORY_DESCRIPTIONS[form.category] ||
          "High quality product available at Kotla Marketplace.";

    const payload = {
      sellerId,
      name,
      originalPrice,
      currentPrice,
      stock,
      category: form.category,
      image: finalImage,
      description: finalDescription,
    };

    setLoading(true);

    try {
      if (editProductData) {
        const productId = editProductData._id || editProductData.id;

        if (!productId) {
          throw new Error("Product ID is missing. Cannot update product.");
        }

        await updateProduct(productId, payload);

        onShowToast?.("Product updated successfully!", "success");
      } else {
        await addProduct(payload);

        onShowToast?.("Product published successfully!", "success");
      }

      setForm(EMPTY_FORM);

      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (error) {
      console.error("Product save error:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while saving the product.";

      onShowToast?.(`Error: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kotla-add-product-page">
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
              {editProductData ? (
                <>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </>
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </>
              )}
            </svg>
          </div>

          <div>
            <h1>
              {editProductData ? "Edit Product Details" : "Publish New Product"}
            </h1>

            <p>
              {editProductData
                ? `Updating: ${editProductData.name || "Product"}`
                : `Posting as Seller: ${user?.name || "Authorized Seller"}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="kotla-form-group">
            <label>Product Name *</label>

            <input
              type="text"
              name="name"
              placeholder="e.g., Men's Unstitched Cotton Suit"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="kotla-form-group">
            <label>Product Image *</label>

            <div className="kotla-image-upload-wrapper">
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`kotla-preview-container ${
                  form.image ? "has-image" : ""
                }`}
              >
                <img
                  src={form.image || DEFAULT_PRODUCT_IMAGE}
                  alt="Product Preview"
                />

                {form.image && isHovered && (
                  <div
                    className="kotla-remove-overlay"
                    onClick={handleRemoveImage}
                  >
                    <span className="kotla-remove-btn-tag">Remove</span>
                  </div>
                )}
              </div>

              <div className="kotla-image-info">
                <p className="kotla-image-status-text">
                  {form.image
                    ? "Custom image uploaded (Hover to remove)"
                    : "Default professional boutique image applied:"}
                </p>

                <label className="kotla-file-upload-label">
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>

                <span className="kotla-file-hint">PNG, JPG or WEBP</span>
              </div>
            </div>
          </div>

          <div className="kotla-form-row">
            <div className="kotla-form-group">
              <label>Original Price (₨) *</label>

              <input
                type="number"
                name="originalPrice"
                placeholder="3500"
                value={form.originalPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="kotla-form-group">
              <label>Sale Price (₨) *</label>

              <input
                type="number"
                name="currentPrice"
                placeholder="2500"
                value={form.currentPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="kotla-form-group">
            <label>Stock Quantity *</label>

            <input
              type="number"
              name="stock"
              placeholder="15"
              value={form.stock}
              onChange={handleChange}
              min="0"
              step="1"
              required
            />
          </div>

          <div className="kotla-form-group">
            <label>Category *</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="cloths">Cloths & Fabrics (Shops)</option>
              <option value="fashion">Fashion & Apparel</option>
              <option value="electronics">Electronics & Gadgets</option>
              <option value="tools">Hardware & Tools</option>
              <option value="beauty">Beauty & Personal Care</option>
            </select>
          </div>

          <div className="kotla-form-group">
            <label>Custom Description (Optional)</label>

            <textarea
              name="description"
              placeholder="Leave blank to use smart category default description..."
              value={form.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="kotla-modal-actions">
            <button
              type="submit"
              disabled={loading}
              className="kotla-submit-btn"
            >
              {loading
                ? "Processing..."
                : editProductData
                ? "Update Product"
                : "Publish Product"}
            </button>

            <button
              type="button"
              onClick={onSuccess}
              className="kotla-cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
