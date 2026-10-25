/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredCart, setStoredCart } from '../services/storageService';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = getStoredCart();
    return Array.isArray(stored) ? stored : [];
  });

  const [notification, setNotification] = useState(null);

  // Persist cart to localStorage
  useEffect(() => {
    setStoredCart(cart);
  }, [cart]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
  }, []);

  const addToCart = useCallback((item) => {
    if (!item.available) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
    showNotification(`${item.name} added to cart`);
  }, [showNotification]);

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => prev.filter((ci) => ci.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) {
      // Remove item if quantity drops below 1
      setCart((prev) => prev.filter((ci) => ci.id !== itemId));
      return;
    }
    setCart((prev) =>
      prev.map((ci) =>
        ci.id === itemId ? { ...ci, quantity: newQuantity } : ci
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getItemQuantity = useCallback((itemId) => {
    const item = cart.find((ci) => ci.id === itemId);
    return item ? item.quantity : 0;
  }, [cart]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cart,
    cartTotal,
    cartCount,
    notification,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    showNotification,
    dismissNotification: () => setNotification(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
