import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function LoginModal({ isOpen, onClose, onLogin, onShowToast }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // OTP Flow States
  const [step, setStep] = useState("input"); // "input" or "otp"
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [confirmationResultObj, setConfirmationResultObj] = useState(null);

  // Timer Effect for OTP Countdown (60 seconds)
  useEffect(() => {
    let interval = null;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Initialize Firebase invisible reCAPTCHA for live phone authentication
  useEffect(() => {
    if (!window.recaptchaVerifier && isOpen) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response) => {
              // reCAPTCHA solved, allow signInWithPhoneNumber
            },
          }
        );
      } catch (error) {
        console.error("Recaptcha initialization error:", error);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        _id: user.uid,
        name: user.displayName || "User",
        email: user.email,
        phone: user.phoneNumber || "N/A",
        type: isSellerMode ? "seller" : "buyer",
        shopName: isSellerMode ? `${user.displayName}'s Store` : undefined,
      };

      onLogin(userData);
      onShowToast(`Welcome, ${user.displayName}!`, "success");
      onClose();
    } catch (error) {
      onShowToast("Google auth failed: " + error.message, "error");
    }
  };

  const handleFacebookAuth = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        _id: user.uid,
        name: user.displayName || "User",
        email: user.email || `${user.uid}@facebook.com`,
        phone: user.phoneNumber || "N/A",
        type: isSellerMode ? "seller" : "buyer",
        shopName: isSellerMode ? `${user.displayName}'s Store` : undefined,
      };

      onLogin(userData);
      onShowToast(`Welcome, ${user.displayName}!`, "success");
      onClose();
    } catch (error) {
      onShowToast("Facebook auth failed: " + error.message, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup) {
      if (!name || !email || !password || !phone) {
        onShowToast("Please fill in all required fields", "warning");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        const userData = {
          _id: user.uid,
          name: name,
          email: user.email,
          phone: `+92${phone}`,
          type: isSellerMode ? "seller" : "buyer",
          shopName: isSellerMode ? `${name}'s Store` : undefined,
        };

        onLogin(userData);
        onShowToast("Account created successfully!", "success");
        onClose();
      } catch (error) {
        onShowToast("Signup failed: " + error.message, "error");
      }
    } else {
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
        onShowToast("Login successful!", "success");
        onClose();
      } catch (error) {
        onShowToast("Invalid email or password.", "error");
      }
    }
  };

  // Dynamic Live Firebase Phone/WhatsApp OTP Trigger
  const handleWhatsAppLogin = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      onShowToast(
        "Please enter a valid phone number e.g. 03046133091",
        "warning"
      );
      return;
    }

    // Format local number (e.g. 03046133091) to international format (+923046133091)
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+92" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+92" + formattedPhone;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmationResultObj(confirmationResult);
      setTimer(60);
      setStep("otp");
      onShowToast(`OTP code sent successfully to ${formattedPhone}`, "success");
    } catch (error) {
      onShowToast("Failed to send OTP: " + error.message, "error");
    }
  };

  const handleResendOtp = async () => {
    try {
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+92" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+92" + formattedPhone;
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      setConfirmationResultObj(confirmationResult);
      setTimer(60);
      onShowToast(`New OTP sent to ${formattedPhone}`, "success");
    } catch (error) {
      onShowToast("Resend failed: " + error.message, "error");
    }
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      onShowToast("Please enter a valid 6-digit OTP code", "warning");
      return;
    }

    try {
      const result = await confirmationResultObj.confirm(otp);
      const user = result.user;

      const userData = {
        _id: user.uid,
        name: user.displayName || "Phone User",
        phone: user.phoneNumber,
        type: "buyer",
      };

      onLogin(userData);
      onShowToast("Phone verification successful!", "success");
      onClose();
    } catch (error) {
      onShowToast("Invalid OTP code. Please try again.", "error");
    }
  };

  return (
    <div className="kotla-modal-overlay">
      <div className="kotla-modal-content">
        <button className="kotla-modal-close" onClick={onClose}>
          ✕
        </button>

        {/* Hidden container required for Firebase live reCAPTCHA verification */}
        <div id="recaptcha-container"></div>

        {step === "input" ? (
          <>
            <h1 className="kotla-modal-title">
              {isSignup
                ? "Create Your Kotla Account"
                : isSellerMode
                ? "👔 Seller Hub Sign In"
                : "Sign In to Kotla"}
            </h1>
            <p className="kotla-modal-subtitle">
              {isSignup
                ? "By creating an account, you agree to our Terms of Use & Privacy Policy."
                : isSellerMode
                ? "Manage your store, products, and inventory"
                : "Access your orders, wishlist, and profile"}
            </p>

            {/* Toggle Account Mode */}
            <div className="kotla-mode-toggle">
              <button
                type="button"
                onClick={() => setIsSellerMode(false)}
                className={`kotla-mode-btn ${
                  !isSellerMode ? "active-buyer" : ""
                }`}
              >
                🛍️ Buyer Account
              </button>
              <button
                type="button"
                onClick={() => setIsSellerMode(true)}
                className={`kotla-mode-btn ${
                  isSellerMode ? "active-seller" : ""
                }`}
              >
                👔 Seller Hub
              </button>
            </div>

            {/* Login Method Tabs */}
            <div className="kotla-method-tabs">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`kotla-tab-btn email ${
                  loginMethod === "email" ? "active" : "inactive"
                }`}
              >
                ✉️ Email / Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("whatsapp")}
                className={`kotla-tab-btn whatsapp ${
                  loginMethod === "whatsapp" ? "active" : "inactive"
                }`}
              >
                💬 WhatsApp Login
              </button>
            </div>

            {loginMethod === "email" ? (
              <form onSubmit={handleSubmit}>
                {isSignup && (
                  <div className="kotla-form-group">
                    <label className="kotla-label">Full Name</label>
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
                  <label className="kotla-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="registered@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="kotla-input"
                  />
                </div>

                <div className="kotla-form-group">
                  <label className="kotla-label">Password</label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    name="password"
                  />
                </div>

                {isSignup && (
                  <div className="kotla-form-group">
                    <label className="kotla-label">Phone Number (+92)</label>
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
                  className={`kotla-submit-btn ${
                    isSellerMode ? "seller" : "buyer"
                  }`}
                >
                  {isSignup ? "CREATE ACCOUNT" : "SECURE LOGIN"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleWhatsAppLogin}>
                <div className="kotla-form-group">
                  <label className="kotla-label">Phone Number (WhatsApp)</label>
                  <div className="kotla-phone-wrapper whatsapp-wrapper">
                    <span className="kotla-phone-prefix whatsapp-prefix">
                      🇵🇰 +92
                    </span>
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

                <button type="submit" className="kotla-whatsapp-submit-btn">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  SEND CODE VIA WHATSAPP
                </button>
              </form>
            )}

            <div className="kotla-divider">
              <div className="kotla-divider-line"></div>
              <span className="kotla-divider-text">OR CONTINUE WITH</span>
              <div className="kotla-divider-line"></div>
            </div>

            {/* Social Buttons */}
            <div className="kotla-social-container">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="kotla-social-btn google"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
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
                Google
              </button>

              <button
                type="button"
                onClick={handleFacebookAuth}
                className="kotla-social-btn facebook"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

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
          /* --- OTP VERIFICATION SCREEN --- */
          <form onSubmit={handleConfirmOtp}>
            <h1 className="kotla-modal-title">Verify your identity</h1>
            <p className="kotla-modal-subtitle">
              Please enter the OTP via WHATSAPP to continue
            </p>

            <div className="kotla-otp-info">
              <div className="kotla-otp-phone-row">
                <span>
                  <strong>Phone Number:</strong> {phone}
                </span>
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="kotla-change-num-btn"
                >
                  Change number
                </button>
              </div>

              <div className="kotla-otp-timer">
                {timer > 0 ? (
                  <span>
                    Resend OTP in <strong>{timer} s</strong>
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
                    </button>{" "}
                    or{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setStep("input");
                        setLoginMethod("whatsapp");
                      }}
                      className="kotla-resend-link"
                    >
                      via Other options
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="kotla-form-group">
              <label className="kotla-label">Enter 6-Digit OTP</label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="kotla-input"
              />
            </div>

            <div className="kotla-otp-actions">
              <button
                type="button"
                onClick={() => setStep("input")}
                className="kotla-back-btn"
              >
                Back
              </button>
              <button type="submit" className="kotla-confirm-btn">
                Confirm
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
