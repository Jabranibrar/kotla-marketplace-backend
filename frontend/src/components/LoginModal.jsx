import React, { useEffect, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import PasswordInput from "./PasswordInput";
import "../styles/loginModal.css";

const firebaseConfig = {
  apiKey: "AIzaSyDwxO18Y8Gev1OCDv3xscmiFNqah7tk-RI",
  authDomain: "kotla-marketplace.firebaseapp.com",
  projectId: "kotla-marketplace",
  storageBucket: "kotla-marketplace.firebasestorage.app",
  messagingSenderId: "808895425208",
  appId: "1:808895425208:web:4417e6ac9082559397624d",
  measurementId: "G-7LQF422ZH3",
};

// Prevent Firebase "already exists" error during React hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function LoginModal({ isOpen, onClose, onLogin, onShowToast }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [step, setStep] = useState("input");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [confirmationResultObj, setConfirmationResultObj] = useState(null);

  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // OTP TIMER
  // ---------------------------------------------------------

  useEffect(() => {
    if (step !== "otp" || timer <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timer]);

  // ---------------------------------------------------------
  // FIREBASE RECAPTCHA
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!document.getElementById("recaptcha-container")) {
      const container = document.createElement("div");
      container.id = "recaptcha-container";
      document.body.appendChild(container);
    }

    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
              console.log("reCAPTCHA solved");
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired");
            },
          }
        );
      } catch (error) {
        console.error("Recaptcha initialization error:", error);
      }
    }

    return undefined;
  }, [isOpen]);

  // ---------------------------------------------------------
  // RESET FORM
  // ---------------------------------------------------------

  const resetForm = () => {
    setIsSignup(false);
    setLoginMethod("email");
    setStep("input");
    setOtp("");
    setTimer(60);
    setConfirmationResultObj(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ---------------------------------------------------------
  // GOOGLE LOGIN
  // ---------------------------------------------------------

  const handleGoogleAuth = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const displayName = user.displayName || "User";

      const userData = {
        _id: user.uid,
        name: displayName,
        email: user.email || "",
        phone: user.phoneNumber || "N/A",
        type: isSellerMode ? "seller" : "buyer",
        ...(isSellerMode
          ? {
              shopName: `${displayName}'s Store`,
            }
          : {}),
      };

      onLogin(userData);

      onShowToast(`Welcome, ${displayName}!`, "success");

      handleClose();
    } catch (error) {
      console.error("Google login error:", error);

      onShowToast(error?.message || "Google authentication failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // EMAIL LOGIN / SIGNUP
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // -------------------------------------------------------
    // SIGNUP
    // -------------------------------------------------------

    if (isSignup) {
      if (!name.trim()) {
        onShowToast("Please enter your full name.", "warning");
        return;
      }

      if (!email.trim()) {
        onShowToast("Please enter your email address.", "warning");
        return;
      }

      if (!password) {
        onShowToast("Please enter your password.", "warning");
        return;
      }

      if (!phone.trim()) {
        onShowToast("Please enter your phone number.", "warning");
        return;
      }

      setLoading(true);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const user = userCredential.user;

        await updateProfile(user, {
          displayName: name.trim(),
        });

        const cleanPhone = phone.trim().replace(/\s+/g, "");

        const formattedPhone = cleanPhone.startsWith("0")
          ? `+92${cleanPhone.substring(1)}`
          : cleanPhone.startsWith("+")
          ? cleanPhone
          : `+92${cleanPhone}`;

        const userData = {
          _id: user.uid,
          name: name.trim(),
          email: user.email || email.trim(),
          phone: formattedPhone,
          type: isSellerMode ? "seller" : "buyer",
          ...(isSellerMode
            ? {
                shopName: `${name.trim()}'s Store`,
              }
            : {}),
        };

        onLogin(userData);

        onShowToast("Account created successfully!", "success");

        handleClose();
      } catch (error) {
        console.error("Signup error:", error);

        let message = "Signup failed.";

        switch (error?.code) {
          case "auth/email-already-in-use":
            message = "This email is already registered.";
            break;

          case "auth/invalid-email":
            message = "Please enter a valid email address.";
            break;

          case "auth/weak-password":
            message = "Password is too weak. Use at least 6 characters.";
            break;

          default:
            message = error?.message || "Unable to create account.";
        }

        onShowToast(message, "error");
      } finally {
        setLoading(false);
      }

      return;
    }

    // -------------------------------------------------------
    // LOGIN
    // -------------------------------------------------------

    if (!email.trim()) {
      onShowToast("Please enter your email address.", "warning");
      return;
    }

    if (!password) {
      onShowToast("Please enter your password.", "warning");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      const fallbackName = user.email?.split("@")[0] || "User";

      const userData = {
        _id: user.uid,
        name: user.displayName || fallbackName,
        email: user.email || email.trim(),
        phone: user.phoneNumber || "N/A",
        type: isSellerMode ? "seller" : "buyer",
        ...(isSellerMode
          ? {
              shopName: `${user.displayName || fallbackName}'s Store`,
            }
          : {}),
      };

      onLogin(userData);

      onShowToast("Login successful!", "success");

      handleClose();
    } catch (error) {
      console.error("Login error:", error);

      let message = "Invalid email or password.";

      switch (error?.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
          message = "Invalid email or password.";
          break;

        case "auth/wrong-password":
          message = "Incorrect password.";
          break;

        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/too-many-requests":
          message = "Too many failed attempts. Please try again later.";
          break;

        case "auth/user-disabled":
          message = "This account has been disabled.";
          break;

        default:
          message = error?.message || "Login failed.";
      }

      onShowToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // FORMAT PHONE NUMBER
  // ---------------------------------------------------------

  const getFormattedPhone = () => {
    let formattedPhone = phone.trim().replace(/\s+/g, "");

    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+92" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+92" + formattedPhone;
    }

    return formattedPhone;
  };

  // ---------------------------------------------------------
  // SEND PHONE OTP
  // ---------------------------------------------------------

  const handleWhatsAppLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!phone.trim()) {
      onShowToast("Please enter your phone number.", "warning");
      return;
    }

    const formattedPhone = getFormattedPhone();

    if (!/^\+92\d{10}$/.test(formattedPhone)) {
      onShowToast(
        "Please enter a valid Pakistani phone number e.g. 03046133091",
        "warning"
      );
      return;
    }

    setLoading(true);

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {},
          }
        );
      }

      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmationResultObj(confirmationResult);

      setTimer(60);
      setOtp("");
      setStep("otp");

      onShowToast(`OTP sent to ${formattedPhone}`, "success");
    } catch (error) {
      console.error("Phone OTP error:", error);

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (clearError) {
          console.error(clearError);
        }

        window.recaptchaVerifier = null;
      }

      onShowToast(error?.message || "Failed to send OTP.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // RESEND OTP
  // ---------------------------------------------------------

  const handleResendOtp = async () => {
    if (loading) return;

    const formattedPhone = getFormattedPhone();

    setLoading(true);

    try {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.error(error);
        }

        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        }
      );

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );

      setConfirmationResultObj(confirmationResult);

      setTimer(60);

      onShowToast(`New OTP sent to ${formattedPhone}`, "success");
    } catch (error) {
      console.error("Resend OTP error:", error);

      onShowToast(error?.message || "Failed to resend OTP.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!confirmationResultObj) {
      onShowToast("OTP session expired. Please request a new code.", "warning");
      setStep("input");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      onShowToast("Please enter a valid 6-digit OTP.", "warning");
      return;
    }

    setLoading(true);

    try {
      const result = await confirmationResultObj.confirm(otp);

      const user = result.user;

      const userData = {
        _id: user.uid,
        name: user.displayName || "Phone User",
        email: user.email || "",
        phone: user.phoneNumber || getFormattedPhone(),
        type: isSellerMode ? "seller" : "buyer",
      };

      if (isSellerMode) {
        userData.shopName = `${user.displayName || "My"}'s Store`;
      }

      onLogin(userData);

      onShowToast("Phone verification successful!", "success");

      handleClose();
    } catch (error) {
      console.error("OTP verification error:", error);

      onShowToast("Invalid OTP code. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // MODAL CLOSED
  // ---------------------------------------------------------

  if (!isOpen) {
    return null;
  }

  // ---------------------------------------------------------
  // JSX
  // ---------------------------------------------------------

  return (
    <div className="kotla-login-overlay">
      {/* Firebase reCAPTCHA container */}
      <div id="recaptcha-container" />

      <div className="kotla-login-modal">
        <button
          type="button"
          className="kotla-modal-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <span>×</span>
        </button>

        <div className="kotla-modal-layout">
          {/* BRAND SIDE */}
          <aside className="kotla-login-brand">
            <div className="kotla-brand-content">
              <div className="kotla-brand-logo">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>

              <span className="kotla-brand-name">KOTLA</span>

              <h2>
                Your local marketplace,
                <span> made simple.</span>
              </h2>

              <p>
                Discover products, support local sellers, and shop with
                confidence on Kotla Marketplace.
              </p>

              <div className="kotla-brand-points">
                <div className="kotla-brand-point">
                  <span className="kotla-icon-badge">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>

                  <div>
                    <strong>Trusted Marketplace</strong>

                    <small>Shop from local sellers</small>
                  </div>
                </div>

                <div className="kotla-brand-point">
                  <span className="kotla-icon-badge">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>

                  <div>
                    <strong>Easy & Secure</strong>

                    <small>Simple and secure authentication</small>
                  </div>
                </div>

                <div className="kotla-brand-point">
                  <span className="kotla-icon-badge">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>

                  <div>
                    <strong>Local Shopping</strong>

                    <small>Built for the Kotla community</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="kotla-brand-footer">© 2026 Kotla Marketplace</div>
          </aside>

          {/* FORM SIDE */}
          <main className="kotla-login-content">
            {step === "input" ? (
              <>
                <div className="kotla-form-header">
                  <span className="kotla-form-eyebrow">
                    {isSellerMode
                      ? "SELLER CENTER"
                      : isSignup
                      ? "GET STARTED"
                      : "WELCOME BACK"}
                  </span>

                  <h1 className="kotla-modal-title">
                    {isSignup
                      ? "Create your account"
                      : isSellerMode
                      ? "Seller Hub Sign In"
                      : "Sign in to Kotla"}
                  </h1>

                  <p className="kotla-modal-subtitle">
                    {isSignup
                      ? "Create your account and start shopping or selling on Kotla."
                      : isSellerMode
                      ? "Manage your store, products, and inventory."
                      : "Access your orders, wishlist, and profile."}
                  </p>
                </div>

                {/* BUYER / SELLER */}
                <div className="kotla-mode-toggle">
                  <button
                    type="button"
                    onClick={() => setIsSellerMode(false)}
                    className={`kotla-mode-btn ${
                      !isSellerMode ? "active-buyer" : ""
                    }`}
                  >
                    <span className="kotla-mode-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </span>

                    <div>
                      <strong>Buyer</strong>
                      <small>Shop products</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSellerMode(true)}
                    className={`kotla-mode-btn ${
                      isSellerMode ? "active-seller" : ""
                    }`}
                  >
                    <span className="kotla-mode-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </span>

                    <div>
                      <strong>Seller</strong>
                      <small>Manage store</small>
                    </div>
                  </button>
                </div>

                {/* LOGIN METHOD */}
                {/* <div className="kotla-method-tabs">
                  <button
                    type="button"
                    onClick={() => setLoginMethod("email")}
                    className={`kotla-tab-btn email ${
                      loginMethod === "email" ? "active" : "inactive"
                    }`}
                  >
                    <span className="kotla-tab-icon">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    Email & Password
                  </button>
                </div> */}

                {/* EMAIL FORM */}
                {loginMethod === "email" ? (
                  <form onSubmit={handleSubmit} className="kotla-auth-form">
                    {isSignup && (
                      <div className="kotla-form-group">
                        <label className="kotla-label-with-icon">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span>Full Name</span>
                        </label>

                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="kotla-input"
                        />
                      </div>
                    )}

                    <div className="kotla-form-group">
                      <label className="kotla-label-with-icon">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <span>Email Address</span>
                      </label>

                      <input
                        type="email"
                        placeholder="registered@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="kotla-input"
                      />
                    </div>

                    <div className="kotla-form-group">
                      <label className="kotla-label-with-icon">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>Password</span>
                      </label>

                      <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        name="password"
                      />
                    </div>

                    {isSignup && (
                      <div className="kotla-form-group">
                        <label className="kotla-label-with-icon">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                          <span>Phone Number</span>
                        </label>

                        <div className="kotla-phone-wrapper">
                          <span className="kotla-phone-prefix">🇵🇰 +92</span>

                          <input
                            type="tel"
                            placeholder="03046133091"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="kotla-phone-input"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={`kotla-submit-btn ${
                        isSellerMode ? "seller" : "buyer"
                      }`}
                    >
                      {loading
                        ? "PLEASE WAIT..."
                        : isSignup
                        ? "CREATE ACCOUNT"
                        : "SECURE LOGIN"}

                      {!loading && (
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
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      )}
                    </button>
                  </form>
                ) : (
                  /* PHONE FORM */
                  <form
                    onSubmit={handleWhatsAppLogin}
                    className="kotla-auth-form"
                  >
                    <div className="kotla-phone-intro">
                      <div className="kotla-phone-icon">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>

                      <div>
                        <strong>Verify with your phone</strong>

                        <p>
                          We'll send a secure verification code to your phone.
                        </p>
                      </div>
                    </div>

                    <div className="kotla-form-group">
                      <label className="kotla-label-with-icon">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span>Phone Number</span>
                      </label>

                      <div className="kotla-phone-wrapper">
                        <span className="kotla-phone-prefix">🇵🇰 +92</span>

                        <input
                          type="tel"
                          placeholder="03046133091"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="kotla-phone-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="kotla-whatsapp-submit-btn"
                    >
                      {loading ? "SENDING..." : "SEND CODE VIA PHONE"}

                      {!loading && (
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
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      )}
                    </button>
                  </form>
                )}

                {/* DIVIDER */}
                <div className="kotla-divider">
                  <div className="kotla-divider-line" />

                  <span className="kotla-divider-text">OR CONTINUE WITH</span>

                  <div className="kotla-divider-line" />
                </div>

                {/* GOOGLE */}
                <div className="kotla-social-container">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="kotla-social-btn google"
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

                    {loading ? "PLEASE WAIT..." : "Continue with Google"}
                  </button>
                </div>

                {/* FOOTER */}
                <div className="kotla-modal-footer">
                  {isSignup ? (
                    <span>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignup(false)}
                        className="kotla-switch-link"
                      >
                        Log in Now
                      </button>
                    </span>
                  ) : (
                    <span>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignup(true)}
                        className="kotla-switch-link"
                      >
                        Sign up
                      </button>
                    </span>
                  )}
                </div>
              </>
            ) : (
              /* OTP SCREEN */
              <form onSubmit={handleConfirmOtp} className="kotla-otp-screen">
                <div className="kotla-otp-hero">
                  <div className="kotla-otp-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>

                  <span className="kotla-form-eyebrow">VERIFICATION</span>

                  <h1 className="kotla-modal-title">Verify your identity</h1>

                  <p className="kotla-modal-subtitle">
                    Please enter the 6-digit verification code sent to your
                    phone.
                  </p>
                </div>

                <div className="kotla-otp-info">
                  <div className="kotla-otp-phone-row">
                    <div>
                      <span className="kotla-otp-label">CODE SENT TO</span>

                      <strong>{phone}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep("input")}
                      className="kotla-change-num-btn"
                    >
                      Change
                    </button>
                  </div>

                  <div className="kotla-otp-timer">
                    {timer > 0 ? (
                      <span>
                        Resend available in <strong>{timer}s</strong>
                      </span>
                    ) : (
                      <span>
                        Didn't receive code?{" "}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="kotla-resend-link"
                        >
                          Resend OTP
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                <div className="kotla-form-group">
                  <label className="kotla-label-with-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Enter 6-Digit OTP</span>
                  </label>

                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="kotla-input kotla-otp-input"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>

                <div className="kotla-otp-actions">
                  <button
                    type="button"
                    onClick={() => setStep("input")}
                    className="kotla-back-btn"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="kotla-confirm-btn"
                  >
                    {loading ? "VERIFYING..." : "Confirm Code"}

                    {!loading && (
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
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
