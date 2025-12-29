// src/context/CartContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { cartAPI } from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const { data } = await cartAPI.get();
      setCart(data.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = useCallback(async (productId, variantId, quantity = 1) => {
    try {
      setIsLoading(true);
      const { data } = await cartAPI.addItem({
        productId,
        variantId,
        quantity,
      });
      setCart(data.data);
      toast.success("Added to cart!");
      setIsCartOpen(true);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add to cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (productId, variantId, quantity) => {
    try {
      setIsLoading(true);
      const { data } = await cartAPI.updateItem({
        productId,
        variantId,
        quantity,
      });
      setCart(data.data);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (productId, variantId) => {
    try {
      setIsLoading(true);
      const { data } = await cartAPI.removeItem(productId, variantId);
      setCart(data.data);
      toast.success("Removed from cart");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove item";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      await cartAPI.clear();
      setCart(null);
      toast.success("Cart cleared");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to clear cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    try {
      setIsLoading(true);
      const { data } = await cartAPI.applyCoupon(code);
      setCart(data.data);
      toast.success("Coupon applied!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid coupon code";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await cartAPI.removeCoupon();
      setCart(data.data);
      toast.success("Coupon removed");
      return { success: true };
    } catch (error) {
      toast.error("Failed to remove coupon");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const itemCount = cart?.items?.length || 0;
  const totalItems =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    isLoading,
    isCartOpen,
    setIsCartOpen,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    itemCount,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
