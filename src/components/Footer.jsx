import React from "react";
import "../styles/main.css";

export default function Footer() {
  return (
    <footer
      className="footer"
      style={{
        backgroundColor: "#1E293B",
        color: "#F8FAFC",
        padding: "50px 0 20px 0",
        marginTop: "auto",
      }}
    >
      <div
        className="footer-content"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
      >
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "30px",
            marginBottom: "40px",
          }}
        >
          <div className="footer-column">
            <h3
              style={{
                color: "#FFFFFF",
                fontSize: "18px",
                marginBottom: "15px",
              }}
            >
              🛍️ Kotla Marketplace
            </h3>
            <p
              style={{ color: "#94A3B8", fontSize: "14px", lineHeight: "1.6" }}
            >
              Your trusted local marketplace for quality products at competitive
              prices across Pakistan.
            </p>
          </div>

          <div className="footer-column">
            <h3
              style={{
                color: "#FFFFFF",
                fontSize: "16px",
                marginBottom: "15px",
              }}
            >
              Categories
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>
                <a
                  href="#/electronics"
                  style={{
                    color: "#94A3B8",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  📱 Electronics
                </a>
              </li>
              <li>
                <a
                  href="#/fashion"
                  style={{
                    color: "#94A3B8",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  👔 Fashion
                </a>
              </li>
              <li>
                <a
                  href="#/tools"
                  style={{
                    color: "#94A3B8",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  🔧 Tools
                </a>
              </li>
              <li>
                <a
                  href="#/beauty"
                  style={{
                    color: "#94A3B8",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  💄 Beauty
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3
              style={{
                color: "#FFFFFF",
                fontSize: "16px",
                marginBottom: "15px",
              }}
            >
              Support
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>
                <a
                  href="#/contact"
                  style={{
                    color: "#94A3B8",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#/faq"
                  style={{
                    color: "#94A3B8",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#/terms"
                  style={{
                    color: "#94A3B8",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#/privacy"
                  style={{
                    color: "#94A3B8",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3
              style={{
                color: "#FFFFFF",
                fontSize: "16px",
                marginBottom: "15px",
              }}
            >
              Connect
            </h3>
            <p
              style={{
                color: "#94A3B8",
                fontSize: "14px",
                margin: "0 0 8px 0",
              }}
            >
              📧 contact@kotlamarketplace.pk
            </p>
            <p
              style={{
                color: "#94A3B8",
                fontSize: "14px",
                margin: "0 0 8px 0",
              }}
            >
              📱 +92-300-XXXXXXX
            </p>
            <p style={{ color: "#94A3B8", fontSize: "14px", margin: 0 }}>
              📍 Kotla Arab Ali Khan, Punjab
            </p>
          </div>
        </div>

        <div
          className="footer-bottom"
          style={{
            borderTop: "1px solid #334155",
            paddingTop: "20px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#64748B", fontSize: "13px", margin: 0 }}>
            &copy; 2026 Kotla Marketplace. All rights reserved. | Made with ❤️
            in Punjab
          </p>
        </div>
      </div>
    </footer>
  );
}
