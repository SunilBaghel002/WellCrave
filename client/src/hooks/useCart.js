// src/hooks/useCart.js
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { cartAPI } from "../api/cart";

export const useCartActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cartAPI.validate();
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || "Cart validation failed";
      setError(message);
      return { success: false, error: message, data: err.response?.data };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncCart = useCallback(async (localCart) => {
    setIsLoading(true);
    setError(null);

    try {
      // Merge local cart with server cart after login
      for (const item of localCart) {
        await cartAPI.addItem({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }

      const response = await cartAPI.get();
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to sync cart";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    validateCart,
    syncCart,
  };
};

export const useLocalCart = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("guestCart");
    return saved ? JSON.parse(saved) : [];
  });

  const saveCart = useCallback((newCart) => {
    setCart(newCart);
    localStorage.setItem("guestCart", JSON.stringify(newCart));
  }, []);

  const addToLocalCart = useCallback((item) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );

      let newCart;
      if (existingIndex >= 0) {
        newCart = [...prev];
        newCart[existingIndex].quantity += item.quantity;
      } else {
        newCart = [...prev, item];
      }

      localStorage.setItem("guestCart", JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const updateLocalCartItem = useCallback((productId, variantId, quantity) => {
    setCart((prev) => {
      const newCart = prev.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      );
      localStorage.setItem("guestCart", JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const removeFromLocalCart = useCallback((productId, variantId) => {
    setCart((prev) => {
      const newCart = prev.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId)
      );
      localStorage.setItem("guestCart", JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const clearLocalCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("guestCart");
  }, []);

  const getLocalCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const getLocalCartCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    addToLocalCart,
    updateLocalCartItem,
    removeFromLocalCart,
    clearLocalCart,
    getLocalCartTotal,
    getLocalCartCount,
    saveCart,
  };
};

export default useCartActions;
