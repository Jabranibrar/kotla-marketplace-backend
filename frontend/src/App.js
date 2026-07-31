import React, { useState, useEffect } from "react";
import { useCart } from "./context/CartContext";
import CartModal from "./components/CartModal";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import LoginModal from "./components/LoginModal";
import AddProductPage from "./components/AddProductPage";
import SellerDashboard from "./components/SellerDashboard";
import CheckoutPage from "./components/CheckoutPage";
import RegisterSeller from "./components/RegisterSeller";
import Toast from "./components/Toast";

function App() {
  const { cartItems, totalPrice, setIsCartOpen } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);

  // Persistent Login state using localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("kotla_is_logged_in") === "true";
  });
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem("kotla_user_type") || null;
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("kotla_user_data");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentPage, setCurrentPage] = useState("home");
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
    setToast({ message, type });
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserType(userData.type || "buyer");
    setUser(userData);
    setLoginOpen(false);
    setCurrentPage("home");
    showToast(`Welcome back, ${userData.name || "User"}!`, "success");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setUser(null);
    setCurrentPage("home");
    localStorage.removeItem("kotla_is_logged_in");
    localStorage.removeItem("kotla_user_type");
    localStorage.removeItem("kotla_user_data");
    showToast("Logged out successfully", "info");
  };

  const handleSellClick = () => {
    if (!isLoggedIn) {
      // If not logged in, take them to the Register Seller page directly
      setCurrentPage("register-seller");
    } else if (userType === "seller") {
      setCurrentPage("seller-dashboard");
    } else {
      // If logged in as buyer, let them register as a seller
      setCurrentPage("register-seller");
    }
  };

  const handleNavigate = (page) => {
    if (page === "home") setCurrentPage("home");
    else if (page === "orders") {
      showToast("Orders feature is coming soon!", "info");
    } else if (page === "addresses") {
      showToast("Saved addresses section", "info");
    } else if (page === "seller-dashboard") {
      setCurrentPage("seller-dashboard");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#F5F5F5",
      }}
    >
      <div>
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
        />
        <CartModal
          onShowToast={showToast}
          onCheckout={() => setCurrentPage("checkout")}
        />
      </div>

      <div style={{ flex: 1 }}>
        {currentPage === "home" && (
          <Home
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onShowToast={showToast}
            onDirectCheckout={() => setCurrentPage("checkout")}
          />
        )}

        {currentPage === "checkout" && (
          <CheckoutPage
            cartItems={cartItems}
            totalPrice={totalPrice}
            user={user}
            onBack={() => setCurrentPage("home")}
            onShowToast={showToast}
          />
        )}

        {currentPage === "register-seller" && (
          <RegisterSeller
            onShowToast={showToast}
            onLoginSuccess={(userData) => {
              handleLogin(userData);
              setCurrentPage("seller-dashboard");
            }}
          />
        )}

        {currentPage === "seller-dashboard" &&
          isLoggedIn &&
          userType === "seller" && (
            <SellerDashboard user={user} onShowToast={showToast} />
          )}

        {currentPage === "add-product" &&
          isLoggedIn &&
          userType === "seller" && (
            <AddProductPage
              user={user}
              onShowToast={showToast}
              onBack={() => setCurrentPage("home")}
            />
          )}
      </div>

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

export default App;
