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
  totalPrice = 0,
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const formattedCartTotal = Number(totalPrice || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <header className="kotla-header">
      <div className="kotla-header-container">
        <div
          className="kotla-logo"
          onClick={() => handleMenuClick("home")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleMenuClick("home");
            }
          }}
        >
          Kotla<span>Market</span>
        </div>

        <div className="kotla-search-box">
          <span className="kotla-search-icon">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            type="text"
            placeholder="Search products, brands and more..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search products"
          />

          {searchQuery && (
            <button
              type="button"
              className="kotla-clear-search"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          )}
        </div>

        <div className="kotla-header-actions">
          <button
            type="button"
            className="kotla-sell-btn"
            onClick={onSellClick}
          >
            {userType === "seller" ? "Seller Dashboard" : "Become a Seller"}
          </button>

          <button
            type="button"
            className="kotla-cart-btn"
            onClick={onCartClick}
            aria-label={`Cart with ${totalItems} items`}
          >
            <span className="kotla-cart-icon-wrapper">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M6 8h12l1 13H5L6 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>

              {totalItems > 0 && (
                <span className="kotla-cart-badge">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </span>

            <span className="kotla-cart-summary">
              <span className="kotla-cart-label">Cart</span>
              <span className="kotla-cart-total">₨{formattedCartTotal}</span>
            </span>
          </button>

          {isLoggedIn ? (
            <div className="kotla-profile-container" ref={dropdownRef}>
              <div
                className={`kotla-profile-trigger ${
                  dropdownOpen ? "active" : ""
                }`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setDropdownOpen(!dropdownOpen);
                  }
                }}
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
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
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
                    <button
                      type="button"
                      onClick={() => handleMenuClick("home")}
                    >
                      <span className="kotla-menu-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="8" r="3" />
                          <path d="M5 20a7 7 0 0 1 14 0" />
                        </svg>
                      </span>
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMenuClick("orders")}
                    >
                      <span className="kotla-menu-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path d="M4 7h16v13H4z" />
                          <path d="M8 7V5a4 4 0 0 1 8 0v2" />
                        </svg>
                      </span>
                      My Orders
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMenuClick("addresses")}
                    >
                      <span className="kotla-menu-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                      </span>
                      Saved Addresses
                    </button>

                    {userType === "seller" && (
                      <button
                        type="button"
                        className="seller-dashboard-link"
                        onClick={() => handleMenuClick("seller-dashboard")}
                      >
                        <span className="kotla-menu-icon">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path d="M4 19V5" />
                            <path d="M4 19h16" />
                            <path d="m7 15 4-5 3 3 5-7" />
                          </svg>
                        </span>
                        Seller Dashboard
                      </button>
                    )}
                  </div>

                  <div className="kotla-dropdown-footer">
                    <button
                      type="button"
                      onClick={() => handleMenuClick("logout")}
                    >
                      <span className="kotla-menu-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path d="M10 17l5-5-5-5" />
                          <path d="M15 12H3" />
                          <path d="M20 4v16" />
                        </svg>
                      </span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="kotla-signin-btn"
              onClick={onLoginClick}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
