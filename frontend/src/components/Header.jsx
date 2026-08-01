import React, { useState, useRef, useEffect } from "react";
import "../styles/header.css";

export default function Header({
  onCartClick,
  onLoginClick,
  isLoggedIn,
  userType,
  onLogout,
  onSellClick,
  onSearchChange,
  searchQuery,
  user,
  onNavigate,
  totalItems = 0,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (action) => {
    setDropdownOpen(false);
    if (action === "logout") {
      onLogout();
    } else if (typeof onNavigate === "function") {
      onNavigate(action);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <header className="kotla-header">
      <div className="kotla-header-container">
        {/* Logo */}
        <div className="kotla-logo" onClick={() => handleMenuClick("home")}>
          Kotla<span>Market</span>
        </div>

        {/* Search Bar */}
        <div className="kotla-search-box">
          <span className="kotla-search-icon">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="kotla-clear-search"
              onClick={() => onSearchChange("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions (Sell, Cart, Profile/Sign In) */}
        <div className="kotla-header-actions">
          <button className="kotla-sell-btn" onClick={onSellClick}>
            {userType === "seller" ? "Seller Dashboard" : "Become a Seller"}
          </button>

          <button className="kotla-cart-btn" onClick={onCartClick}>
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {totalItems > 0 && (
              <span className="kotla-cart-badge">{totalItems}</span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="kotla-profile-container" ref={dropdownRef}>
              <div
                className={`kotla-profile-trigger ${
                  dropdownOpen ? "active" : ""
                }`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="kotla-user-avatar">
                  {getUserInitials(user?.name)}
                </div>
                <span className="kotla-user-name">
                  {user?.name?.split(" ")[0] || "Account"}
                </span>
                <span
                  className={`kotla-dropdown-arrow ${
                    dropdownOpen ? "open" : ""
                  }`}
                >
                  ▼
                </span>
              </div>

              {dropdownOpen && (
                <div className="kotla-dropdown-menu">
                  <div className="kotla-dropdown-header">
                    <p className="kotla-signed-label">Signed in as</p>
                    <p className="kotla-signed-name">
                      {user?.name || "Kotla User"}
                    </p>
                    <span
                      className={`kotla-user-type-badge ${
                        userType === "seller" ? "seller" : "buyer"
                      }`}
                    >
                      {userType === "seller"
                        ? "Seller Profile"
                        : "Buyer Profile"}
                    </span>
                  </div>

                  <div className="kotla-dropdown-links">
                    <button onClick={() => handleMenuClick("home")}>
                      <span>👤</span> My Profile
                    </button>
                    <button onClick={() => handleMenuClick("orders")}>
                      <span>📦</span> My Orders
                    </button>
                    <button onClick={() => handleMenuClick("addresses")}>
                      <span>📍</span> Saved Addresses
                    </button>

                    {userType === "seller" && (
                      <button
                        className="seller-dashboard-link"
                        onClick={() => handleMenuClick("seller-dashboard")}
                      >
                        <span>📊</span> Seller Dashboard
                      </button>
                    )}
                  </div>

                  <div className="kotla-dropdown-footer">
                    <button onClick={() => handleMenuClick("logout")}>
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="kotla-signin-btn" onClick={onLoginClick}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
