import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { createOrder, getAddresses, addAddress } from "../api"; // Make sure getAddresses and addAddress are exported from your api.js
import "../styles/checkoutPage.css";

export default function CheckoutPage({
  cartItems,
  totalPrice,
  user,
  onBack,
  onShowToast,
}) {
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const userId = user?._id || user?.id || "guest";

  // Main Confirmed State
  const [invoiceEmail, setInvoiceEmail] = useState(user?.email || "");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Temporary Modal State (Changes apply ONLY when SAVE is clicked)
  const [tempEmail, setTempEmail] = useState("");
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState(null);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    building: "",
    locality: "",
    province: "",
    city: "",
    area: "",
    label: "HOME",
  });

  // Fetch saved addresses from backend on mount so they don't disappear
  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        if (userId && userId !== "guest") {
          const response = await getAddresses(userId); // Backend call to get user addresses
          if (response && response.length > 0) {
            setAddresses(response);
            setSelectedAddressId(response[0].id || response[0]._id);
            setTempSelectedAddressId(response[0].id || response[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load saved addresses", err);
      }
    };
    fetchUserAddresses();
  }, [userId]);

  const selectedAddress =
    addresses.find((a) => (a.id || a._id) === selectedAddressId) || null;
  const tempSelectedAddress =
    addresses.find((a) => (a.id || a._id) === tempSelectedAddressId) || null;

  const handleOpenInvoiceModal = () => {
    setTempEmail(invoiceEmail);
    setTempSelectedAddressId(selectedAddressId);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoiceModal = () => {
    setInvoiceEmail(tempEmail);
    setSelectedAddressId(tempSelectedAddressId);
    setIsInvoiceModalOpen(false);
    if (onShowToast)
      onShowToast("Invoice and Contact Info updated successfully!", "success");
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.city ||
      !newAddress.building
    ) {
      if (onShowToast)
        onShowToast("Please fill in required address fields", "warning");
      return;
    }

    const addressPayload = {
      userId: userId,
      name: newAddress.fullName,
      phone: newAddress.phone,
      label: newAddress.label,
      address: `${newAddress.building}, ${newAddress.locality}`,
      region: `${newAddress.province} - ${newAddress.city} - ${newAddress.area}`,
    };

    try {
      // Save address to backend database permanently
      const savedAddress = await addAddress(addressPayload);
      const created = savedAddress || {
        id: Date.now(),
        ...addressPayload,
      };

      const updatedAddresses = [...addresses, created];
      setAddresses(updatedAddresses);
      const newId = created.id || created._id;
      setTempSelectedAddressId(newId);
      setSelectedAddressId(newId);

      setIsAddAddressOpen(false);
      setIsInvoiceModalOpen(true);
      if (onShowToast) onShowToast("New address saved permanently!", "success");
    } catch (err) {
      if (onShowToast)
        onShowToast("Failed to save address to database", "error");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      if (onShowToast) onShowToast("Your cart is empty!", "warning");
      return;
    }

    if (!selectedAddress) {
      if (onShowToast)
        onShowToast("Please select or add a shipping address", "warning");
      return;
    }

    setLoading(true);

    const orderData = {
      buyerId: userId,
      buyerEmail: invoiceEmail || user?.email || "guest@kotla.com",
      buyerName: selectedAddress.name,
      items: cartItems.map((item) => ({
        productId: item._id || item.id,
        name: item.name,
        price: item.currentPrice,
        quantity: item.quantity,
        sellerId: item.sellerId || "admin",
      })),
      totalAmount: totalPrice,
      paymentMethod: "Cash on Delivery (COD)",
      shippingAddress: `${selectedAddress.address}, ${selectedAddress.region} (Phone: ${selectedAddress.phone}) [Label: ${selectedAddress.label}]`,
      createdAt: new Date().toISOString(),
    };

    try {
      await createOrder(orderData);
      if (onShowToast) {
        onShowToast(
          "Order placed successfully! Confirmation emails sent.",
          "success"
        );
      }
      if (typeof clearCart === "function") clearCart();
      onBack();
    } catch (err) {
      if (onShowToast) {
        onShowToast("Failed to place order. Try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="daraz-checkout-wrapper">
      {/* Professional Top Navigation */}
      <div className="daraz-checkout-topbar">
        <button onClick={onBack} className="daraz-back-btn" disabled={loading}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Continue Shopping</span>
        </button>
        <h2>Secure Checkout</h2>
      </div>

      <div className="daraz-checkout-grid">
        <div className="daraz-checkout-main">
          {/* Shipping & Billing Box */}
          <div className="daraz-section-box">
            <div className="daraz-section-header">
              <span>Shipping & Billing</span>
              <button
                type="button"
                className="daraz-edit-btn"
                onClick={() => {
                  setTempSelectedAddressId(selectedAddressId);
                  setIsAddressModalOpen(true);
                }}
              >
                {selectedAddress ? "EDIT" : "+ ADD ADDRESS"}
              </button>
            </div>

            {selectedAddress ? (
              <div className="daraz-selected-address-card">
                <div className="daraz-address-user-info">
                  <strong>{selectedAddress.name}</strong>
                  <span className="daraz-phone-badge">
                    {selectedAddress.phone}
                  </span>
                </div>
                <div className="daraz-address-details">
                  <span className="daraz-label-pill">
                    {selectedAddress.label}
                  </span>
                  <p>{selectedAddress.address}</p>
                  <p className="daraz-region-text">
                    Region: {selectedAddress.region}
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#666" }}
              >
                <p>No shipping address added yet.</p>
                <button
                  type="button"
                  className="daraz-confirm-order-btn"
                  style={{
                    marginTop: "10px",
                    width: "auto",
                    display: "inline-block",
                    padding: "8px 16px",
                  }}
                  onClick={() => setIsAddAddressOpen(true)}
                >
                  + Add Address Now
                </button>
              </div>
            )}
          </div>

          {/* Package items */}
          <div className="daraz-section-box">
            <div className="daraz-package-header">
              <span>Package 1 of 1</span>
              <span className="daraz-shipped-by">
                Shipped by <b>KOTLA STORE</b>
              </span>
            </div>
            <p className="daraz-delivery-type">Delivery or Pickup</p>

            {cartItems.map((item, index) => {
              const discountPercent = item.originalPrice
                ? Math.round(
                    ((item.originalPrice - item.currentPrice) /
                      item.originalPrice) *
                      100
                  )
                : 0;

              return (
                <div key={index} className="daraz-checkout-item-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="daraz-item-thumb"
                  />
                  <div className="daraz-item-details">
                    <h4>{item.name}</h4>
                    <p className="daraz-item-meta">
                      Color Family: {item.colorFamily || "Random"}
                    </p>
                  </div>
                  <div className="daraz-item-pricing">
                    <span className="daraz-current-price">
                      Rs. {item.currentPrice * item.quantity}
                    </span>
                    {item.originalPrice && (
                      <span className="daraz-original-price">
                        Rs. {item.originalPrice * item.quantity}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="daraz-discount-badge">
                        -{discountPercent}%
                      </span>
                    )}
                    <span className="daraz-qty-text">Qty: {item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="daraz-checkout-sidebar">
          {/* Invoice and Contact Info Box */}
          <div className="daraz-summary-card" style={{ marginBottom: "15px" }}>
            <div
              className="daraz-section-header daraz-section-invoice-header"
              style={{ fontSize: "15px" }}
            >
              <span>Invoice and Contact Info</span>
              <button
                type="button"
                className="daraz-edit-btn"
                onClick={handleOpenInvoiceModal}
              >
                EDIT
              </button>
            </div>
            {/* <div style={{ fontSize: "13px", color: "#555" }}>
              <p style={{ margin: "4px 0" }}>
                <strong>Email:</strong> {invoiceEmail || "Not provided"}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Billing Address:</strong>{" "}
                {selectedAddress
                  ? `${selectedAddress.address}, ${selectedAddress.region}`
                  : "Not selected"}
              </p>
            </div> */}
          </div>

          {/* Order Summary Box */}
          <div className="daraz-summary-card">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>
                Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)}{" "}
                items)
              </span>
              <span>Rs. {totalPrice}</span>
            </div>
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span>Rs. 0</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>Rs. {totalPrice}</span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              className="daraz-confirm-order-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="daraz-spinner"></span> Processing Order...
                </>
              ) : (
                "PROCEED TO PAY"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- INVOICE AND CONTACT INFO MODAL --- */}
      {isInvoiceModalOpen && (
        <div
          className="daraz-modal-overlay"
          onClick={() => setIsInvoiceModalOpen(false)}
        >
          <div
            className="daraz-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="daraz-modal-header">
              <h3>Invoice and Contact Info</h3>
              <button onClick={() => setIsInvoiceModalOpen(false)}>✕</button>
            </div>

            <div className="daraz-modal-body">
              <div className="daraz-form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email to get delivery status updates"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                />
                <small style={{ color: "#777", fontSize: "11px" }}>
                  Enter your email to get delivery status updates
                </small>
              </div>

              <div style={{ marginTop: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <label
                    style={{
                      fontWeight: "600",
                      fontSize: "13px",
                      color: "#333",
                    }}
                  >
                    Billing Address
                  </label>
                  <button
                    type="button"
                    className="daraz-edit-btn"
                    onClick={() => {
                      setIsInvoiceModalOpen(false);
                      setIsAddressModalOpen(true);
                    }}
                  >
                    {tempSelectedAddress ? "EDIT" : "+ ADD"}
                  </button>
                </div>

                {tempSelectedAddress ? (
                  <div
                    className="daraz-selected-address-card"
                    style={{ background: "#f9f9f9" }}
                  >
                    <div className="daraz-address-user-info">
                      <strong>{tempSelectedAddress.name}</strong>
                      <span className="daraz-phone-badge">
                        {tempSelectedAddress.phone}
                      </span>
                    </div>
                    <div className="daraz-address-details">
                      <p>{tempSelectedAddress.address}</p>
                      <p className="daraz-region-text">
                        Region: {tempSelectedAddress.region}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      padding: "10px",
                      background: "#f9f9f9",
                      borderRadius: "6px",
                    }}
                  >
                    No billing address selected yet. Click edit/add to choose
                    one.
                  </p>
                )}
                <small
                  style={{
                    color: "#777",
                    fontSize: "11px",
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  Please edit your billing address
                </small>
              </div>
            </div>

            <div className="daraz-modal-footer">
              <button
                type="button"
                className="daraz-btn-cancel"
                onClick={() => setIsInvoiceModalOpen(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="daraz-btn-save"
                onClick={handleSaveInvoiceModal}
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADDRESS SELECTION MODAL --- */}
      {isAddressModalOpen && (
        <div
          className="daraz-modal-overlay"
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div
            className="daraz-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="daraz-modal-header">
              <h3>Select Billing / Shipping Address</h3>
              <button onClick={() => setIsAddressModalOpen(false)}>✕</button>
            </div>

            <div className="daraz-modal-body">
              <button
                type="button"
                className="daraz-add-new-address-btn"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setIsAddAddressOpen(true);
                }}
              >
                + Add new address
              </button>

              {addresses.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#777",
                    padding: "20px 0",
                  }}
                >
                  No saved addresses found. Please add a new address.
                </p>
              ) : (
                <div className="daraz-address-list">
                  {addresses.map((addr) => {
                    const addrId = addr.id || addr._id;
                    return (
                      <label
                        key={addrId}
                        className={`daraz-address-radio-box ${
                          tempSelectedAddressId === addrId ? "active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="tempSelectedAddress"
                          checked={tempSelectedAddressId === addrId}
                          onChange={() => setTempSelectedAddressId(addrId)}
                        />
                        <div className="daraz-radio-content">
                          <div className="daraz-radio-title">
                            <strong>{addr.name}</strong>
                            <span>{addr.phone}</span>
                          </div>
                          <div className="daraz-radio-address">
                            <span className="badge">{addr.label}</span>{" "}
                            {addr.address}
                          </div>
                          <div className="daraz-radio-region">
                            Region: {addr.region}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="daraz-modal-footer">
              <button
                type="button"
                className="daraz-btn-cancel"
                onClick={() => setIsAddressModalOpen(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="daraz-btn-save"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setIsInvoiceModalOpen(true);
                }}
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD NEW ADDRESS MODAL --- */}
      {isAddAddressOpen && (
        <div
          className="daraz-modal-overlay"
          onClick={() => setIsAddAddressOpen(false)}
        >
          <div
            className="daraz-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="daraz-modal-header">
              <h3>Add new shipping Address</h3>
              <button onClick={() => setIsAddAddressOpen(false)}>✕</button>
            </div>

            <form
              onSubmit={handleAddAddressSubmit}
              className="daraz-modal-body"
            >
              <div className="daraz-form-group">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newAddress.fullName}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="daraz-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="03001234567"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="daraz-form-group">
                <label>Building / House No / Floor / Street</label>
                <input
                  type="text"
                  placeholder="House #123, Street #4"
                  value={newAddress.building}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, building: e.target.value })
                  }
                  required
                />
              </div>

              <div className="daraz-form-group">
                <label>Colony / Suburb / Locality / Landmark</label>
                <input
                  type="text"
                  placeholder="Near Main Market"
                  value={newAddress.locality}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, locality: e.target.value })
                  }
                />
              </div>

              <div className="daraz-form-row">
                <div className="daraz-form-group">
                  <label>Province</label>
                  <select
                    value={newAddress.province}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, province: e.target.value })
                    }
                    required
                  >
                    <option value="">Please choose your province</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="KPK">KPK</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                  </select>
                </div>

                <div className="daraz-form-group">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Gujrat"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="daraz-form-group">
                <label>Area</label>
                <input
                  type="text"
                  placeholder="e.g. Kotla Arab Ali Khan"
                  value={newAddress.area}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, area: e.target.value })
                  }
                />
              </div>

              <div className="daraz-form-group">
                <label>Select a label for effective delivery:</label>
                <div className="daraz-label-radio-group">
                  <button
                    type="button"
                    className={`label-pill-btn ${
                      newAddress.label === "OFFICE" ? "active" : ""
                    }`}
                    onClick={() =>
                      setNewAddress({ ...newAddress, label: "OFFICE" })
                    }
                  >
                    OFFICE
                  </button>
                  <button
                    type="button"
                    className={`label-pill-btn ${
                      newAddress.label === "HOME" ? "active" : ""
                    }`}
                    onClick={() =>
                      setNewAddress({ ...newAddress, label: "HOME" })
                    }
                  >
                    HOME
                  </button>
                </div>
              </div>

              <div
                className="daraz-modal-footer"
                style={{ padding: 0, marginTop: "20px" }}
              >
                <button
                  type="button"
                  className="daraz-btn-cancel"
                  onClick={() => {
                    setIsAddAddressOpen(false);
                    setIsInvoiceModalOpen(true);
                  }}
                >
                  CANCEL
                </button>
                <button type="submit" className="daraz-btn-save">
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
