import React, { useState } from "react";
import { registerSeller } from "../api";
import PasswordInput from "./PasswordInput";

export default function RegisterSeller({ onShowToast, onLoginSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await registerSeller({ ...form, type: "seller" });

      const registeredUser = response.data?.user || {
        _id: "usr_" + Date.now(),
        name: form.name,
        email: form.email,
        type: "seller",
        shopName: form.shopName,
      };

      const msg = `✅ Seller registered successfully! Welcome, ${
        registeredUser.shopName || form.shopName
      }`;
      if (onShowToast) onShowToast(msg, "success");
      else alert(msg);

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess({ ...registeredUser, type: "seller" });
      }

      setForm({ name: "", email: "", password: "", phone: "", shopName: "" });
    } catch (error) {
      const errMsg =
        "❌ Error: " + (error.response?.data?.error || error.message);
      if (onShowToast) onShowToast(errMsg, "error");
      else alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid #E2E8F0",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#16A34A",
          marginBottom: "10px",
          fontSize: "26px",
          fontWeight: "bold",
        }}
      >
        📝 Become a Seller
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "#64748B",
          marginBottom: "30px",
          fontSize: "14px",
        }}
      >
        Start selling on Kotla Marketplace and reach local customers
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              color: "#475569",
              fontSize: "13px",
            }}
          >
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              color: "#475569",
              fontSize: "13px",
            }}
          >
            Email *
          </label>
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              color: "#475569",
              fontSize: "13px",
            }}
          >
            Password *
          </label>
          <PasswordInput
            value={form.password}
            onChange={handleChange}
            placeholder="Secure password"
            name="password"
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              color: "#475569",
              fontSize: "13px",
            }}
          >
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="03001234567"
            value={form.phone}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              color: "#475569",
              fontSize: "13px",
            }}
          >
            Shop Name *
          </label>
          <input
            type="text"
            name="shopName"
            placeholder="Your shop name"
            value={form.shopName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: loading ? "#94A3B8" : "#16A34A",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {loading ? "Registering Shop..." : "Register Shop Profile"}
        </button>
      </form>
    </div>
  );
}
