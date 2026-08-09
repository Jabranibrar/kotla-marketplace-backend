import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { createOrder, getAddresses, addAddress } from "../api";
import "../styles/checkoutPage.css";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80&ixlib=rb-4.0.3";

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

  const [invoiceEmail, setInvoiceEmail] = useState(user?.email || "");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [tempEmail, setTempEmail] = useState("");
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState(null);

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

  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        if (userId && userId !== "guest") {
          const response = await getAddresses(userId);

          if (response && response.length > 0) {
            setAddresses(response);

            const firstAddressId = response[0].id || response[0]._id;

            setSelectedAddressId(firstAddressId);
            setTempSelectedAddressId(firstAddressId);
          }
        }
      } catch (err) {
        console.error("Failed to load saved addresses", err);
      }
    };

    fetchUserAddresses();
  }, [userId]);

  const selectedAddress =
    addresses.find(
      (address) => (address.id || address._id) === selectedAddressId
    ) || null;

  const tempSelectedAddress =
    addresses.find(
      (address) => (address.id || address._id) === tempSelectedAddressId
    ) || null;

  const formatPrice = (price) => Number(price || 0).toLocaleString("en-PK");

  const totalItems = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const handleOpenInvoiceModal = () => {
    setTempEmail(invoiceEmail);
    setTempSelectedAddressId(selectedAddressId);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoiceModal = () => {
    setInvoiceEmail(tempEmail);
    setSelectedAddressId(tempSelectedAddressId);
    setIsInvoiceModalOpen(false);

    if (onShowToast) {
      onShowToast("Invoice and Contact Info updated successfully!", "success");
    }
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();

    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.city ||
      !newAddress.building
    ) {
      if (onShowToast) {
        onShowToast("Please fill in required address fields", "warning");
      }
      return;
    }

    const addressPayload = {
      userId,
      name: newAddress.fullName,
      phone: newAddress.phone,
      label: newAddress.label,
      address: `${newAddress.building}, ${newAddress.locality}`,
      region: `${newAddress.province} - ${newAddress.city} - ${newAddress.area}`,
    };

    try {
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

      if (onShowToast) {
        onShowToast("New address saved permanently!", "success");
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast("Failed to save address to database", "error");
      }
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      if (onShowToast) {
        onShowToast("Your cart is empty!", "warning");
      }
      return;
    }

    if (!selectedAddress) {
      if (onShowToast) {
        onShowToast("Please select or add a shipping address", "warning");
      }
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

      if (typeof clearCart === "function") {
        clearCart();
      }

      onBack();
    } catch (err) {
      if (onShowToast) {
        onShowToast("Failed to place order. Try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty-state">
          <div className="checkout-empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>

          <h2>Your cart is empty</h2>
          <p>Add some products to your cart before checking out.</p>

          <button
            type="button"
            className="checkout-primary-btn checkout-empty-btn"
            onClick={onBack}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page-inner">
        <header className="checkout-header">
          <button type="button" className="checkout-back-btn" onClick={onBack}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span>Continue Shopping</span>
          </button>

          <div className="checkout-heading">
            <h1>Secure Checkout</h1>
            <div className="checkout-security">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <span>Safe & Secure</span>
            </div>
          </div>
        </header>

        <div className="checkout-progress">
          <div className="checkout-progress-step active">
            <span>1</span>
            <div>
              <strong>Checkout</strong>
              <small>Review your order</small>
            </div>
          </div>

          <div className="checkout-progress-line" />

          <div className="checkout-progress-step">
            <span>2</span>
            <div>
              <strong>Confirmation</strong>
              <small>Order successfully placed</small>
            </div>
          </div>
        </div>

        <div className="checkout-layout">
          <main className="checkout-main">
            <section className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-card-title">
                  <div className="checkout-section-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <h2>Shipping Address</h2>
                    <p>Where should we deliver your order?</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-text-btn"
                  onClick={() => {
                    setTempSelectedAddressId(selectedAddressId);
                    setIsAddressModalOpen(true);
                  }}
                >
                  {selectedAddress ? "Edit" : "Add Address"}
                </button>
              </div>

              {selectedAddress ? (
                <div className="checkout-selected-address">
                  <div className="checkout-address-main">
                    <div className="checkout-address-top">
                      <strong>{selectedAddress.name}</strong>
                      <span className="checkout-address-label">
                        {selectedAddress.label}
                      </span>
                    </div>

                    <p>{selectedAddress.address}</p>

                    <p className="checkout-address-region">
                      {selectedAddress.region}
                    </p>

                    <div className="checkout-phone">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
                      </svg>
                      {selectedAddress.phone}
                    </div>
                  </div>

                  <div className="checkout-address-check">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="checkout-no-address">
                  <p>No shipping address added yet.</p>
                  <button
                    type="button"
                    className="checkout-outline-btn"
                    onClick={() => setIsAddAddressOpen(true)}
                  >
                    + Add Address
                  </button>
                </div>
              )}
            </section>

            <section className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-card-title">
                  <div className="checkout-section-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <path d="M3 6h18" />
                    </svg>
                  </div>
                  <div>
                    <h2>Order Items</h2>
                    <p>
                      {totalItems} {totalItems === 1 ? "item" : "items"} in your
                      order
                    </p>
                  </div>
                </div>

                <span className="checkout-seller">KOTLA STORE</span>
              </div>

              <div className="checkout-items">
                {cartItems.map((item, index) => {
                  const discountPercent = item.originalPrice
                    ? Math.round(
                        ((item.originalPrice - item.currentPrice) /
                          item.originalPrice) *
                          100
                      )
                    : 0;

                  const image =
                    item.image && item.image.trim() !== ""
                      ? item.image
                      : DEFAULT_PRODUCT_IMAGE;

                  return (
                    <div
                      key={item._id || item.id || index}
                      className="checkout-item"
                    >
                      <div className="checkout-item-image">
                        <img src={image} alt={item.name} />
                      </div>

                      <div className="checkout-item-info">
                        <h3>{item.name}</h3>

                        <p>Color Family: {item.colorFamily || "Random"}</p>

                        <span className="checkout-item-quantity">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="checkout-item-price">
                        <strong>
                          Rs. {formatPrice(item.currentPrice * item.quantity)}
                        </strong>

                        {item.originalPrice && (
                          <span>
                            Rs.{" "}
                            {formatPrice(item.originalPrice * item.quantity)}
                          </span>
                        )}

                        {discountPercent > 0 && (
                          <small>-{discountPercent}%</small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-card-title">
                  <div className="checkout-section-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M3 10h18" />
                      <path d="M7 15h4" />
                    </svg>
                  </div>
                  <div>
                    <h2>Payment Method</h2>
                    <p>Available payment option</p>
                  </div>
                </div>
              </div>

              <div className="checkout-payment-method active">
                <div className="checkout-payment-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </div>

                <div>
                  <strong>Cash on Delivery</strong>
                  <p>Pay when your order arrives</p>
                </div>

                <div className="checkout-payment-check">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </div>
              </div>
            </section>
          </main>

          <aside className="checkout-sidebar">
            <div className="checkout-summary-card">
              <div className="checkout-summary-header">
                <h2>Order Summary</h2>
                <span>{totalItems} items</span>
              </div>

              <div className="checkout-summary-lines">
                <div>
                  <span>Subtotal</span>
                  <strong>Rs. {formatPrice(totalPrice)}</strong>
                </div>

                <div>
                  <span>Shipping Fee</span>
                  <strong className="checkout-free">FREE</strong>
                </div>
              </div>

              <div className="checkout-summary-total">
                <span>Total</span>
                <strong>Rs. {formatPrice(totalPrice)}</strong>
              </div>

              <button
                type="button"
                className="checkout-place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="checkout-spinner" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>

              <div className="checkout-secure-note">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <span>Your information is protected and secure.</span>
              </div>
            </div>

            <div className="checkout-contact-card">
              <div className="checkout-contact-header">
                <div>
                  <h3>Invoice & Contact</h3>
                  <p>Where should we send updates?</p>
                </div>

                <button type="button" onClick={handleOpenInvoiceModal}>
                  Edit
                </button>
              </div>

              <div className="checkout-contact-email">
                <span>Email</span>
                <strong>{invoiceEmail || "Not provided"}</strong>
              </div>

              <div className="checkout-contact-address">
                <span>Billing Address</span>
                <strong>
                  {selectedAddress
                    ? `${selectedAddress.address}, ${selectedAddress.region}`
                    : "Not selected"}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isInvoiceModalOpen && (
        <div
          className="checkout-modal-overlay"
          onClick={() => setIsInvoiceModalOpen(false)}
        >
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <div>
                <h3>Invoice & Contact Info</h3>
                <p>Update your contact and billing details.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="checkout-modal-body">
              <div className="checkout-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                />
                <small>
                  Delivery status and order updates will be sent to this email.
                </small>
              </div>

              <div className="checkout-modal-address-section">
                <div className="checkout-modal-subheader">
                  <div>
                    <label>Billing Address</label>
                    <small>Select an address for your order.</small>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsInvoiceModalOpen(false);
                      setTempSelectedAddressId(selectedAddressId);
                      setIsAddressModalOpen(true);
                    }}
                  >
                    {tempSelectedAddress ? "Change" : "+ Add"}
                  </button>
                </div>

                {tempSelectedAddress ? (
                  <div className="checkout-modal-address-card">
                    <strong>{tempSelectedAddress.name}</strong>
                    <span>{tempSelectedAddress.phone}</span>
                    <p>{tempSelectedAddress.address}</p>
                    <p>{tempSelectedAddress.region}</p>
                  </div>
                ) : (
                  <div className="checkout-modal-empty">
                    No billing address selected.
                  </div>
                )}
              </div>
            </div>

            <div className="checkout-modal-footer">
              <button
                type="button"
                className="checkout-modal-cancel"
                onClick={() => setIsInvoiceModalOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="checkout-modal-save"
                onClick={handleSaveInvoiceModal}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddressModalOpen && (
        <div
          className="checkout-modal-overlay"
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <div>
                <h3>Select Address</h3>
                <p>Choose where your order should be delivered.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="checkout-modal-body">
              <button
                type="button"
                className="checkout-add-address-btn"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setIsAddAddressOpen(true);
                }}
              >
                <span>+</span>
                Add New Address
              </button>

              {addresses.length === 0 ? (
                <div className="checkout-address-empty">
                  <p>No saved addresses found.</p>
                  <span>Add a new address to continue.</span>
                </div>
              ) : (
                <div className="checkout-address-list">
                  {addresses.map((addr) => {
                    const addrId = addr.id || addr._id;
                    const isActive = tempSelectedAddressId === addrId;

                    return (
                      <label
                        key={addrId}
                        className={`checkout-address-option ${
                          isActive ? "active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="checkoutAddress"
                          checked={isActive}
                          onChange={() => setTempSelectedAddressId(addrId)}
                        />

                        <div className="checkout-address-option-content">
                          <div className="checkout-address-option-top">
                            <strong>{addr.name}</strong>

                            <span>{addr.label}</span>
                          </div>

                          <p>{addr.address}</p>

                          <small>{addr.region}</small>

                          <small>{addr.phone}</small>
                        </div>

                        <div className="checkout-radio-check">
                          {isActive && (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="checkout-modal-footer">
              <button
                type="button"
                className="checkout-modal-cancel"
                onClick={() => setIsAddressModalOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="checkout-modal-save"
                onClick={() => {
                  setSelectedAddressId(tempSelectedAddressId);
                  setIsAddressModalOpen(false);
                  setIsInvoiceModalOpen(true);
                }}
              >
                Select Address
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddAddressOpen && (
        <div
          className="checkout-modal-overlay"
          onClick={() => setIsAddAddressOpen(false)}
        >
          <div
            className="checkout-modal checkout-add-address-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="checkout-modal-header">
              <div>
                <h3>Add New Address</h3>
                <p>Enter your delivery information below.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddAddressOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddAddressSubmit}
              className="checkout-modal-form"
            >
              <div className="checkout-form-grid">
                <div className="checkout-form-group full">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newAddress.fullName}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        fullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="checkout-form-group full">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="checkout-form-group full">
                  <label>Building / House No / Floor / Street</label>
                  <input
                    type="text"
                    placeholder="House #123, Street #4"
                    value={newAddress.building}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        building: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="checkout-form-group full">
                  <label>Colony / Suburb / Locality / Landmark</label>
                  <input
                    type="text"
                    placeholder="Near Main Market"
                    value={newAddress.locality}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        locality: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="checkout-form-group">
                  <label>Province</label>
                  <select
                    value={newAddress.province}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        province: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select province</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="KPK">KPK</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                  </select>
                </div>

                <div className="checkout-form-group">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Gujrat"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        city: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="checkout-form-group full">
                  <label>Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Kotla Arab Ali Khan"
                    value={newAddress.area}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        area: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="checkout-form-group full">
                  <label>Address Label</label>

                  <div className="checkout-label-options">
                    <button
                      type="button"
                      className={newAddress.label === "HOME" ? "active" : ""}
                      onClick={() =>
                        setNewAddress({
                          ...newAddress,
                          label: "HOME",
                        })
                      }
                    >
                      Home
                    </button>

                    <button
                      type="button"
                      className={newAddress.label === "OFFICE" ? "active" : ""}
                      onClick={() =>
                        setNewAddress({
                          ...newAddress,
                          label: "OFFICE",
                        })
                      }
                    >
                      Office
                    </button>
                  </div>
                </div>
              </div>

              <div className="checkout-modal-footer">
                <button
                  type="button"
                  className="checkout-modal-cancel"
                  onClick={() => {
                    setIsAddAddressOpen(false);
                    setIsInvoiceModalOpen(true);
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="checkout-modal-save">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
