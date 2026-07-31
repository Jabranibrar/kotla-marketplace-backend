import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("kotla_cart_items");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      // ✨ Safe storage serialization to prevent QuotaExceededError
      const safeItems = cartItems.map((item) => ({
        _id: item._id || item.id,
        name: item.name,
        currentPrice: item.currentPrice,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
        sellerId: item.sellerId,
        // Agar image bohot bari (Base64) hai toh localStorage quota bachane ke liye safe fallback ya choti link rakhein
        image:
          item.image && item.image.startsWith("data:image")
            ? "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"
            : item.image,
      }));
      localStorage.setItem("kotla_cart_items", JSON.stringify(safeItems));
    } catch (error) {
      console.warn(
        "Storage quota exceeded, clearing heavy elements from cart cache."
      );
      // Fallback: Save without images if quota fails
      const minimalItems = cartItems.map((item) => ({
        _id: item._id || item.id,
        name: item.name,
        currentPrice: item.currentPrice,
        quantity: item.quantity,
      }));
      localStorage.setItem("kotla_cart_items", JSON.stringify(minimalItems));
    }
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const productId = product._id || product.id;
      const existing = prevItems.find(
        (item) => (item._id || item.id) === productId
      );
      if (existing) {
        return prevItems.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => (item._id || item.id) !== id)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("kotla_cart_items");
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.currentPrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
