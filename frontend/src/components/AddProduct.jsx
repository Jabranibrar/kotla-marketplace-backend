import React, { useState, useEffect } from "react";
import { addProduct, updateProduct } from "../api";

// ✨ Professional Clothing & Marketplace Default Image
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";

// ✨ Category-wise default professional descriptions
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
    description: "", // ✨ Added back description to state
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

      // ✨ Agar user ne custom description di hai toh wo jayegi, warna category ki default
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
          onShowToast("✅ Product updated successfully!", "success");
      } else {
        await addProduct(payload);
        if (onShowToast)
          onShowToast("✅ Product published successfully!", "success");
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
      if (onShowToast) onShowToast(`❌ Error: ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "550px",
        margin: "0 auto",
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #E2E8F0",
      }}
    >
      <h2
        style={{
          color: "#1E293B",
          marginBottom: "20px",
          fontSize: "22px",
          fontWeight: "bold",
        }}
      >
        {editProductData ? "✏️ Edit Product Details" : "➕ Add New Product"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Men's Unstitched Cotton Suit"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Image Section */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Product Image *
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              padding: "15px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #CBD5E1",
              borderRadius: "10px",
            }}
          >
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "8px",
                overflow: "hidden",
                border: "2px solid #E2E8F0",
                backgroundColor: "#FFF",
                flexShrink: 0,
                cursor: form.image ? "pointer" : "default",
                boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
              }}
            >
              <img
                src={form.image || DEFAULT_PRODUCT_IMAGE}
                alt="Product Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.2s ease",
                  transform:
                    isHovered && form.image ? "scale(1.05)" : "scale(1)",
                }}
              />

              {form.image && isHovered && (
                <div
                  onClick={handleRemoveImage}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(15, 23, 42, 0.75)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      backgroundColor: "#DC2626",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    Remove
                  </span>
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "13px",
                  color: "#334155",
                  margin: "0 0 6px 0",
                  fontWeight: "600",
                }}
              >
                {form.image
                  ? "Custom image uploaded (Hover to remove)"
                  : "Default professional boutique image applied:"}
              </p>
              <label
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  backgroundColor: "#FFFFFF",
                  color: "#2563EB",
                  border: "1px solid #BFDBFE",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                📁 Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
              <span
                style={{
                  fontSize: "11px",
                  color: "#64748B",
                  marginLeft: "8px",
                }}
              >
                PNG, JPG or WEBP
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "5px",
              }}
            >
              Original Price (₨) *
            </label>
            <input
              type="number"
              name="originalPrice"
              placeholder="3500"
              value={form.originalPrice}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "5px",
              }}
            >
              Sale Price (₨) *
            </label>
            <input
              type="number"
              name="currentPrice"
              placeholder="2500"
              value={form.currentPrice}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            placeholder="15"
            value={form.stock}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Category *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              fontWeight: "500",
              color: "#1E293B",
              backgroundColor: "#FFFFFF",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <option value="cloths">👕 Cloths & Fabrics (Shops)</option>
            <option value="fashion">👗 Fashion & Apparel</option>
            <option value="electronics">📱 Electronics & Gadgets</option>
            <option value="tools">🔧 Hardware & Tools</option>
            <option value="beauty">💄 Beauty & Personal Care</option>
          </select>
        </div>

        {/* ✨ Custom Description Input Field Restored Here */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "5px",
            }}
          >
            Custom Description (Optional)
          </label>
          <textarea
            name="description"
            placeholder="Leave blank to use smart category default description..."
            value={form.description}
            onChange={handleChange}
            rows="3"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#2563EB",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "15px",
              opacity: loading ? 0.7 : 1,
            }}
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
            style={{
              padding: "12px 20px",
              backgroundColor: "#E2E8F0",
              color: "#334155",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
