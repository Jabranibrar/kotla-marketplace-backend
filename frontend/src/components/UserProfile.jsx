import React, { useState, useRef, useEffect } from "react";
import "../styles/main.css";

export default function UserProfile({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { icon: "👤", label: "Manage My Account", href: "#/account" },
    { icon: "📦", label: "My Orders", href: "#/orders" },
    { icon: "❤️", label: "My Wishlist", href: "#/wishlist" },
    { icon: "⭐", label: "My Reviews", href: "#/reviews" },
    { icon: "↩️", label: "Returns & Cancellations", href: "#/returns" },
  ];

  return (
    <div
      className="user-profile-section"
      ref={dropdownRef}
      style={{ position: "relative" }}
    >
      <button
        className="user-profile-button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          backgroundColor: "#F1F5F9",
          color: "#1E293B",
          border: "1px solid #CBD5E1",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        👤 {user?.name?.split(" ")[0] || "Account"}
      </button>

      {dropdownOpen && (
        <div
          className="dropdown-menu active"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            width: "240px",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            className="dropdown-header"
            style={{
              padding: "14px 16px",
              backgroundColor: "#F8FAFC",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            <div
              className="dropdown-header-name"
              style={{
                fontWeight: "bold",
                color: "#1E293B",
                fontSize: "14px",
                marginBottom: "2px",
              }}
            >
              👤 {user?.name || "User"}
            </div>
            <div
              className="dropdown-header-email"
              style={{
                fontSize: "12px",
                color: "#64748B",
                wordBreak: "break-all",
              }}
            >
              {user?.email || "user@kotla.pk"}
            </div>
          </div>

          <ul
            className="dropdown-items"
            style={{ listStyle: "none", padding: "6px 0", margin: 0 }}
          >
            {menuItems.map((item, index) => (
              <li key={index} className="dropdown-item">
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    alert(`${item.label} - Coming soon`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    color: "#334155",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F1F5F9")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>{item.icon}</span> {item.label}
                </a>
              </li>
            ))}

            <li
              className="dropdown-item dropdown-logout"
              style={{ borderTop: "1px solid #E2E8F0", marginTop: "4px" }}
            >
              <a
                href="#logout"
                onClick={(e) => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  onLogout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  color: "#DC2626",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#FEF2F2")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span>🚪</span> Logout
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
