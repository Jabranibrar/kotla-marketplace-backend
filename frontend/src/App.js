import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useCart } from "./context/CartContext";

import CartModal from "./components/CartModal";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import Toast from "./components/Toast";

import Home from "./pages/Home";
import CheckoutPage from "./pages/CheckoutPage";
import AddProductPage from "./pages/AddProductPage";
import SellerDashboard from "./pages/SellerDashboard";
import RegisterSeller from "./pages/RegisterSeller";

function AppContent() {
  const { cartItems, totalPrice, setIsCartOpen, clearCart } = useCart();
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("kotla_is_logged_in") === "true";
  });

  const [userType, setUserType] = useState(() => {
    return localStorage.getItem("kotla_user_type") || null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("kotla_user_data");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("kotla_is_logged_in", isLoggedIn);
    localStorage.setItem("kotla_user_type", userType || "");

    if (user) {
      localStorage.setItem("kotla_user_data", JSON.stringify(user));
    } else {
      localStorage.removeItem("kotla_user_data");
    }
  }, [isLoggedIn, userType, user]);

  const showToast = (message, type = "info") => {
    setToast({
      message,
      type,
    });
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserType(userData.type || "buyer");
    setUser(userData);
    setLoginOpen(false);

    navigate("/");

    showToast(`Welcome back, ${userData.name || "User"}!`, "success");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setUser(null);
    clearCart();
    localStorage.removeItem("kotla_is_logged_in");
    localStorage.removeItem("kotla_user_type");
    localStorage.removeItem("kotla_user_data");

    navigate("/");

    showToast("Logged out successfully", "info");
  };

  const handleSellClick = () => {
    if (!isLoggedIn) {
      navigate("/register-seller");
      return;
    }

    if (userType === "seller") {
      navigate("/seller-dashboard");
      return;
    }

    navigate("/register-seller");
  };

  const handleNavigate = (page) => {
    if (page === "home") {
      navigate("/");
      return;
    }

    if (page === "orders") {
      showToast("Orders feature is coming soon!", "info");
      return;
    }

    if (page === "addresses") {
      showToast("Saved addresses section", "info");
      return;
    }

    if (page === "seller-dashboard") {
      if (isLoggedIn && userType === "seller") {
        navigate("/seller-dashboard");
      } else {
        navigate("/register-seller");
      }
    }
  };

  return (
    <div className="app-shell">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setLoginOpen(true)}
        isLoggedIn={isLoggedIn}
        userType={userType}
        onLogout={handleLogout}
        onSellClick={handleSellClick}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        user={user}
        onNavigate={handleNavigate}
        totalItems={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        totalPrice={totalPrice}
      />

      <CartModal
        onShowToast={showToast}
        onCheckout={() => navigate("/checkout")}
      />

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onShowToast={showToast}
                onDirectCheckout={() => navigate("/checkout")}
                user={user}
                onOpenLoginModal={() => setLoginOpen(true)}
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                totalPrice={totalPrice}
                user={user}
                onBack={() => navigate("/")}
                onShowToast={showToast}
              />
            }
          />

          <Route
            path="/register-seller"
            element={
              <RegisterSeller
                onShowToast={showToast}
                onLoginSuccess={(userData) => {
                  handleLogin(userData);
                  navigate("/seller-dashboard");
                }}
              />
            }
          />

          <Route
            path="/seller-dashboard"
            element={
              isLoggedIn && userType === "seller" ? (
                <SellerDashboard user={user} onShowToast={showToast} />
              ) : (
                <Navigate to="/register-seller" replace />
              )
            }
          />

          <Route
            path="/add-product"
            element={
              isLoggedIn && userType === "seller" ? (
                <AddProductPage
                  user={user}
                  onShowToast={showToast}
                  onBack={() => navigate("/seller-dashboard")}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
        onShowToast={showToast}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
