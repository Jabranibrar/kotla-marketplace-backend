import React, { useState } from "react";
import { registerSeller } from "../api";
import PasswordInput from "../components/PasswordInput";
import "../styles/registerSeller.css";

export default function RegisterSeller({ onShowToast, onLoginSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await registerSeller({
        ...form,
        type: "seller",
      });

      const registeredUser = response.data?.user || {
        _id: "usr_" + Date.now(),
        name: form.name,
        email: form.email,
        type: "seller",
        shopName: form.shopName,
      };

      const message = `Seller registered successfully! Welcome, ${
        registeredUser.shopName || form.shopName
      }`;

      if (onShowToast) {
        onShowToast(message, "success");
      } else {
        alert(message);
      }

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess({
          ...registeredUser,
          type: "seller",
        });
      }

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        shopName: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || "Something went wrong";

      const message = `Error: ${errorMessage}`;

      if (onShowToast) {
        onShowToast(message, "error");
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-seller-page">
      <div className="register-seller-container">
        <div className="register-seller-card">
          <div className="register-seller-header">
            <div className="register-seller-icon">
              <span>+</span>
            </div>

            <span className="register-seller-eyebrow">Kotla Marketplace</span>

            <h1>Become a Seller</h1>

            <p>
              Create your shop and start selling your products to customers.
            </p>
          </div>

          <form className="register-seller-form" onSubmit={handleSubmit}>
            <div className="register-form-group">
              <label htmlFor="seller-name">
                Full Name
                <span>*</span>
              </label>

              <input
                id="seller-name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="seller-email">
                Email Address
                <span>*</span>
              </label>

              <input
                id="seller-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="seller-password">
                Password
                <span>*</span>
              </label>

              <PasswordInput
                value={form.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                name="password"
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="seller-phone">
                Phone Number
                <span>*</span>
              </label>

              <input
                id="seller-phone"
                type="tel"
                name="phone"
                placeholder="03001234567"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="seller-shop-name">
                Shop Name
                <span>*</span>
              </label>

              <input
                id="seller-shop-name"
                type="text"
                name="shopName"
                placeholder="Enter your shop name"
                value={form.shopName}
                onChange={handleChange}
                autoComplete="organization"
                required
              />
            </div>

            <button
              type="submit"
              className="register-seller-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="register-seller-spinner" />
                  Creating Shop...
                </>
              ) : (
                "Create Seller Account"
              )}
            </button>
          </form>

          <p className="register-seller-note">
            By creating a seller account, you can manage products, pricing and
            inventory from your seller dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
