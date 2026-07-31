import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import PasswordInput from "./PasswordInput";
import "../styles/main.css";

const firebaseConfig = {
  apiKey: "AIzaSyDwxO18Y8Gev1OCDv3xscmiFNqah7tk-RI",
  authDomain: "kotla-marketplace.firebaseapp.com",
  projectId: "kotla-marketplace",
  storageBucket: "kotla-marketplace.firebasestorage.app",
  messagingSenderId: "808895425208",
  appId: "1:808895425208:web:4417e6ac9082559397624d",
  measurementId: "G-7LQF422ZH3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function LoginModal({ isOpen, onClose, onLogin, onShowToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSellerMode, setIsSellerMode] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        _id: user.uid,
        name: user.displayName,
        email: user.email,
        phone: user.phoneNumber || "N/A",
        type: isSellerMode ? "seller" : "buyer",
        shopName: isSellerMode ? `${user.displayName}'s Store` : undefined,
      };

      onLogin(userData);
      onShowToast(
        `Welcome back, ${user.displayName}! (${
          isSellerMode ? "Seller Hub" : "Buyer"
        })`,
        "success"
      );
      onClose();
    } catch (error) {
      onShowToast("Google login failed: " + error.message, "error");
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        _id: user.uid,
        name: user.displayName,
        email: user.email,
        phone: user.phoneNumber || "N/A",
        type: isSellerMode ? "seller" : "buyer",
        shopName: isSellerMode ? `${user.displayName}'s Store` : undefined,
      };

      onLogin(userData);
      onShowToast(
        `Welcome back, ${user.displayName}! (${
          isSellerMode ? "Seller Hub" : "Buyer"
        })`,
        "success"
      );
      onClose();
    } catch (error) {
      onShowToast("Facebook login failed: " + error.message, "error");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      onShowToast("Please enter both email and password", "warning");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userData = {
        _id: user.uid,
        name: user.displayName || email.split("@")[0],
        email: user.email,
        type: isSellerMode ? "seller" : "buyer",
        shopName: isSellerMode ? `${email.split("@")[0]}'s Store` : undefined,
      };

      onLogin(userData);
      onShowToast(
        `Login successful! (${isSellerMode ? "Seller Hub" : "Buyer"})`,
        "success"
      );
      onClose();
    } catch (error) {
      onShowToast(
        "❌ Invalid email or password. Please register first.",
        "error"
      );
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "#FFFFFF",
          padding: "35px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <button
          className="modal-close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#64748B",
          }}
        >
          ✕
        </button>

        <h1
          style={{
            fontSize: "22px",
            marginBottom: "5px",
            color: "#1E293B",
            fontWeight: "bold",
          }}
        >
          {isSellerMode ? "👔 Seller Hub Sign In" : "Sign In to Kotla"}
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "15px" }}>
          {isSellerMode
            ? "Manage your store, products, and inventory"
            : "Access your orders, wishlist, and profile"}
        </p>

        {/* Toggle Button */}
        <div
          style={{
            display: "flex",
            marginBottom: "20px",
            backgroundColor: "#F1F5F9",
            padding: "4px",
            borderRadius: "8px",
          }}
        >
          <button
            type="button"
            onClick={() => setIsSellerMode(false)}
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: !isSellerMode ? "#FFFFFF" : "transparent",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: !isSellerMode ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              color: !isSellerMode ? "#1E293B" : "#64748B",
            }}
          >
            🛍️ Buyer Account
          </button>
          <button
            type="button"
            onClick={() => setIsSellerMode(true)}
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: isSellerMode ? "#FFFFFF" : "transparent",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: isSellerMode ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              color: isSellerMode ? "#2563EB" : "#64748B",
            }}
          >
            👔 Seller Hub
          </button>
        </div>

        {/* Social Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              padding: "12px",
              backgroundColor: "#FFFFFF",
              color: "#334155",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.15v3.15C3.13 21.32 7.23 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.15C.42 8.04 0 9.67 0 11.4s.42 3.36 1.15 4.82l4.13-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.13 2.68 1.15 6.58l4.13 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              padding: "12px",
              backgroundColor: "#1877F2",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            textAlign: "center",
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, borderBottom: "1px solid #E2E8F0" }}></div>
          <span
            style={{
              padding: "0 10px",
              fontSize: "12px",
              color: "#94A3B8",
              fontWeight: "500",
            }}
          >
            OR WITH EMAIL
          </span>
          <div style={{ flex: 1, borderBottom: "1px solid #E2E8F0" }}></div>
        </div>

        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "5px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="registered@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "5px",
              }}
            >
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              name="password"
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isSellerMode ? "#2563EB" : "#0F172A",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {isSellerMode ? "LOGIN TO SELLER HUB" : "SECURE LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
