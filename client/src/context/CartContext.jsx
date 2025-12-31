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

  // Fetch cart - must be declared before useEffect that uses it
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await cartAPI.get();
      setCart(data.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, fetchCart]);

  // Open cart drawer
  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  // Close cart drawer
  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  // Toggle cart drawer
  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  // Add to cart
  const addToCart = useCallback(
    async (productId, variantId, quantity = 1) => {
      if (!isAuthenticated) {
        toast.error("Please login to add items to cart");
        // Store product info for adding after login
        const pendingCartItem = {
          productId,
          variantId,
          quantity,
          timestamp: Date.now(),
        };
        localStorage.setItem("pendingCartItem", JSON.stringify(pendingCartItem));
        
        // Redirect to login page with return URL
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return { success: false, error: "Not authenticated" };
      }

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
        const message =
          error.response?.data?.message || "Failed to add to cart";
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (productId, variantId, quantity) => {
      if (!isAuthenticated) return { success: false };

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
        const message =
          error.response?.data?.message || "Failed to update cart";
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Remove from cart
  const removeFromCart = useCallback(
    async (productId, variantId) => {
      if (!isAuthenticated) return { success: false };

      try {
        setIsLoading(true);
        const { data } = await cartAPI.removeItem(productId, variantId);
        setCart(data.data);
        toast.success("Removed from cart");
        return { success: true };
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to remove item";
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return { success: false };

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
  }, [isAuthenticated]);

  // Apply coupon
  const applyCoupon = useCallback(
    async (code) => {
      if (!isAuthenticated) return { success: false };

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
    },
    [isAuthenticated]
  );

  // Remove coupon
  const removeCoupon = useCallback(async () => {
    if (!isAuthenticated) return { success: false };

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
  }, [isAuthenticated]);

  // Process pending cart item after authentication
  const processPendingCartItem = useCallback(async () => {
    const pendingItemStr = localStorage.getItem("pendingCartItem");
    if (!pendingItemStr || !isAuthenticated) {
      return;
    }

    try {
      const pendingItem = JSON.parse(pendingItemStr);
      // Check if item is not too old (within 1 hour)
      if (Date.now() - pendingItem.timestamp > 3600000) {
        localStorage.removeItem("pendingCartItem");
        return;
      }

      // Add item to cart
      const result = await addToCart(
        pendingItem.productId,
        pendingItem.variantId,
        pendingItem.quantity
      );

      if (result.success) {
        localStorage.removeItem("pendingCartItem");
      }
    } catch (error) {
      console.error("Error processing pending cart item:", error);
      localStorage.removeItem("pendingCartItem");
    }
  }, [isAuthenticated, addToCart]);

  // Process pending cart item when cart is fetched (only once per cart load)
  useEffect(() => {
    if (isAuthenticated && cart !== null && !isLoading) {
      // Check if there's a pending item before processing
      const pendingItemStr = localStorage.getItem("pendingCartItem");
      if (pendingItemStr) {
        // Small delay to ensure cart is fully loaded
        const timer = setTimeout(() => {
          processPendingCartItem();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, cart, isLoading, processPendingCartItem]);

  // Calculate counts
  const itemCount = cart?.items?.length || 0;
  const totalItems =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    isLoading,
    isCartOpen,
    setIsCartOpen,
    openCart,
    closeCart,
    toggleCart,
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
