import React, { useState, useRef, useEffect } from "react";
import "../styles/main.css";

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
    <header
      className="header"
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div
        className="header-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          onClick={() => handleMenuClick("home")}
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            color: "#1E293B",
            cursor: "pointer",
          }}
        >
          Kotla<span style={{ color: "#2563EB" }}>Market</span>
        </div>

        <div
          className="header-search"
          style={{
            flex: 1,
            maxWidth: "500px",
            margin: "0 25px",
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "12px",
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
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
            style={{
              width: "100%",
              padding: "10px 36px 10px 38px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #CBD5E1",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                right: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748B",
                fontSize: "16px",
                fontWeight: "bold",
                padding: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div
          className="header-actions"
          style={{ display: "flex", alignItems: "center", gap: "20px" }}
        >
          <button
            onClick={onSellClick}
            style={{
              padding: "8px 14px",
              backgroundColor: "#EFF6FF",
              color: "#2563EB",
              border: "1px solid #BFDBFE",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {userType === "seller" ? "Seller Dashboard" : "Become a Seller"}
          </button>

          <button
            onClick={onCartClick}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#334155",
              padding: "8px",
            }}
          >
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
              <span
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  backgroundColor: "#DC2626",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: "bold",
                  padding: "1px 5px",
                  borderRadius: "10px",
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#1E293B",
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  backgroundColor: dropdownOpen ? "#F1F5F9" : "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#2563EB",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {getUserInitials(user?.name)}
                </div>
                <span
                  style={{
                    maxWidth: "110px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name?.split(" ")[0] || "Account"}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#64748B",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  ▼
                </span>
              </div>

              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50px",
                    width: "240px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    zIndex: 1100,
                  }}
                >
                  <div
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid #F1F5F9",
                      backgroundColor: "#F8FAFC",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: "#64748B",
                        margin: 0,
                        fontWeight: "600",
                      }}
                    >
                      Signed in as
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#1E293B",
                        margin: "3px 0 0 0",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.name || "Kotla User"}
                    </p>
                    {/* DYNAMIC USER TYPE BADGE FIX */}
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        fontSize: "10px",
                        backgroundColor:
                          userType === "seller" ? "#EFF6FF" : "#F0FDF4",
                        color: userType === "seller" ? "#2563EB" : "#166534",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      {userType === "seller"
                        ? "Seller Profile"
                        : "Buyer Profile"}
                    </span>
                  </div>

                  <div style={{ padding: "6px 0" }}>
                    <button
                      onClick={() => handleMenuClick("home")}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        fontSize: "13px",
                        color: "#334155",
                        cursor: "pointer",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>👤</span> My Profile
                    </button>
                    <button
                      onClick={() => handleMenuClick("orders")}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        fontSize: "13px",
                        color: "#334155",
                        cursor: "pointer",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>📦</span> My Orders
                    </button>
                    <button
                      onClick={() => handleMenuClick("addresses")}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        fontSize: "13px",
                        color: "#334155",
                        cursor: "pointer",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>📍</span> Saved Addresses
                    </button>

                    {userType === "seller" && (
                      <button
                        onClick={() => handleMenuClick("seller-dashboard")}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          fontSize: "13px",
                          color: "#2563EB",
                          cursor: "pointer",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span>📊</span> Seller Dashboard
                      </button>
                    )}
                  </div>

                  <div
                    style={{ borderTop: "1px solid #F1F5F9", padding: "6px 0" }}
                  >
                    <button
                      onClick={() => handleMenuClick("logout")}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        fontSize: "13px",
                        color: "#DC2626",
                        cursor: "pointer",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2563EB",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
