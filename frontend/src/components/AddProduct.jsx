import React, { useState, useEffect } from "react";
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

export default function AddProduct({
  user,
  onShowToast,
  onSuccess,
  editProductData,
}) {
  const [form, setForm] = useState({
    name: "",
    originalPrice: "",
    currentPrice: "",
    stock: "",
    category: "cloths",
    image: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (editProductData) {
      setForm({
        name: editProductData.name || "",
        originalPrice: editProductData.originalPrice || "",
        currentPrice: editProductData.currentPrice || "",
        stock: editProductData.stock || "",
        category: editProductData.category || "cloths",
        image: editProductData.image || "",
        description: editProductData.description || "",
      });
    }
  }, [editProductData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!user?._id && !user?.id) {
      if (onShowToast) onShowToast("Please login as a seller first", "error");
      return;
    }

    setLoading(true);
    try {
      const sellerId = user._id || user.id;
      const finalImage =
        form.image && form.image.trim() !== ""
          ? form.image
          : DEFAULT_PRODUCT_IMAGE;

      const finalDescription =
        form.description && form.description.trim() !== ""
          ? form.description
          : CATEGORY_DESCRIPTIONS[form.category] ||
            "High quality product available at Kotla Marketplace.";

      const payload = {
        ...form,
        sellerId,
        image: finalImage,
        description: finalDescription,
        originalPrice: parseFloat(form.originalPrice),
        currentPrice: parseFloat(form.currentPrice),
        stock: parseInt(form.stock),
      };

      if (editProductData) {
        const productId = editProductData._id || editProductData.id;
        await updateProduct(productId, payload);
        if (onShowToast)
          onShowToast("Product updated successfully!", "success");
      } else {
        await addProduct(payload);
        if (onShowToast)
          onShowToast("Product published successfully!", "success");
      }

      setForm({
        name: "",
        originalPrice: "",
        currentPrice: "",
        stock: "",
        category: "cloths",
        image: "",
        description: "",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || error.message || "Something went wrong";
      if (onShowToast) onShowToast(`Error: ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kotla-product-modal">
      <h2 className="kotla-modal-header">
        {editProductData ? (
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        ) : (
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
        )}
        {editProductData ? "Edit Product Details" : "Publish New Product"}
      </h2>

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

        {/* Image Section */}
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
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
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
          <div className="kotla-form-group" style={{ marginBottom: 0 }}>
            <label>Original Price (₨) *</label>
            <input
              type="number"
              name="originalPrice"
              placeholder="3500"
              value={form.originalPrice}
              onChange={handleChange}
              required
            />
          </div>

          <div className="kotla-form-group" style={{ marginBottom: 0 }}>
            <label>Sale Price (₨) *</label>
            <input
              type="number"
              name="currentPrice"
              placeholder="2500"
              value={form.currentPrice}
              onChange={handleChange}
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
            required
          />
        </div>

        {/* Category Dropdown */}
        <div className="kotla-form-group">
          <label>Category *</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="cloths">Cloths & Fabrics (Shops)</option>
            <option value="fashion">Fashion & Apparel</option>
            <option value="electronics">Electronics & Gadgets</option>
            <option value="tools">Hardware & Tools</option>
            <option value="beauty">Beauty & Personal Care</option>
          </select>
        </div>

        {/* Custom Description Input Field */}
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
          <button type="submit" disabled={loading} className="kotla-submit-btn">
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
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
