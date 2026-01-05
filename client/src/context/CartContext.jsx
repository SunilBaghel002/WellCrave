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

// LocalStorage key for guest cart
const GUEST_CART_KEY = "guestCart";

// Helper functions for guest cart
const getGuestCart = () => {
  try {
    const cartData = localStorage.getItem(GUEST_CART_KEY);
    return cartData ? JSON.parse(cartData) : { items: [] };
  } catch (error) {
    console.error("Error reading guest cart:", error);
    return { items: [] };
  }
};

const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving guest cart:", error);
  }
};

const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error("Error clearing guest cart:", error);
  }
};

// Calculate cart totals for guest cart
const calculateGuestCartTotals = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const discount = 0; // Guest carts don't support coupons
  const shipping = subtotal >= 500 ? 0 : 50; // Free shipping above 500
  const tax = (subtotal - discount) * 0.18; // 18% GST
  const total = subtotal - discount + shipping + tax;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
  };
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load guest cart from localStorage
  const loadGuestCart = useCallback(() => {
    const guestCart = getGuestCart();
    if (guestCart.items && guestCart.items.length > 0) {
      const totals = calculateGuestCartTotals(guestCart.items);
      setCart({
        ...guestCart,
        ...totals,
      });
    } else {
      setCart(null);
    }
  }, []);

  // Fetch cart - must be declared before useEffect that uses it
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      loadGuestCart();
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
  }, [isAuthenticated, loadGuestCart]);

  // Sync guest cart to server after login
  const syncGuestCartToServer = useCallback(async () => {
    if (!isAuthenticated) return false;

    const guestCart = getGuestCart();
    if (!guestCart.items || guestCart.items.length === 0) {
      clearGuestCart();
      return false;
    }

    try {
      // Add each item from guest cart to server cart
      for (const item of guestCart.items) {
        try {
          await cartAPI.addItem({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          });
        } catch (error) {
          console.error("Error syncing cart item:", error);
          // Continue with other items even if one fails
        }
      }

      // Clear guest cart after successful sync
      clearGuestCart();
      return true;
    } catch (error) {
      console.error("Error syncing guest cart:", error);
      return false;
    }
  }, [isAuthenticated]);

  // Fetch cart when authenticated status changes
  useEffect(() => {
    if (isAuthenticated) {
      // Sync guest cart first, then fetch server cart
      const syncAndFetch = async () => {
        await syncGuestCartToServer();
        await fetchCart();
      };
      syncAndFetch();
    } else {
      loadGuestCart();
    }
  }, [isAuthenticated, fetchCart, loadGuestCart, syncGuestCartToServer]);

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
    async (productId, variantId, quantity = 1, productData = null) => {
      // Guest cart: add to localStorage
      if (!isAuthenticated) {
        try {
          const guestCart = getGuestCart();
          const existingItemIndex = guestCart.items.findIndex(
            (item) =>
              (item.productId === productId || item.product === productId) &&
              (item.variantId === variantId || item.variant === variantId)
          );

          if (existingItemIndex >= 0) {
            guestCart.items[existingItemIndex].quantity += quantity;
          } else {
            // Add new item - need product data for guest cart
            if (!productData) {
              toast.error("Product data is required for guest cart");
              return { success: false, error: "Product data missing" };
            }

            guestCart.items.push({
              product: productId, // Store as 'product' to match server cart structure
              variant: variantId, // Store as 'variant' to match server cart structure
              productId, // Keep for sync purposes
              variantId, // Keep for sync purposes
              quantity,
              name: productData.name || "Product",
              price: productData.price || 0,
              image: productData.image || "",
              size: productData.size || "",
              weight: productData.weight || 0,
              weightUnit: productData.weightUnit || "g",
            });
          }

          saveGuestCart(guestCart);
          const totals = calculateGuestCartTotals(guestCart.items);
          setCart({
            ...guestCart,
            ...totals,
          });
          toast.success("Added to cart!");
          setIsCartOpen(true);
          return { success: true };
        } catch (error) {
          console.error("Error adding to guest cart:", error);
          toast.error("Failed to add to cart");
          return { success: false, error: "Failed to add to cart" };
        }
      }

      // Authenticated: add to server cart
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
      // Guest cart: update in localStorage
      if (!isAuthenticated) {
        try {
          const guestCart = getGuestCart();
          const itemIndex = guestCart.items.findIndex(
            (item) =>
              (item.productId === productId || item.product === productId) &&
              (item.variantId === variantId || item.variant === variantId)
          );

          if (itemIndex >= 0) {
            guestCart.items[itemIndex].quantity = quantity;
            saveGuestCart(guestCart);
            const totals = calculateGuestCartTotals(guestCart.items);
            setCart({
              ...guestCart,
              ...totals,
            });
            return { success: true };
          }
          return { success: false };
        } catch (error) {
          console.error("Error updating guest cart:", error);
          return { success: false, error: "Failed to update cart" };
        }
      }

      // Authenticated: update on server
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
      // Guest cart: remove from localStorage
      if (!isAuthenticated) {
        try {
          const guestCart = getGuestCart();
          guestCart.items = guestCart.items.filter(
            (item) =>
              !(
                (item.productId === productId || item.product === productId) &&
                (item.variantId === variantId || item.variant === variantId)
              )
          );
          saveGuestCart(guestCart);
          
          if (guestCart.items.length > 0) {
            const totals = calculateGuestCartTotals(guestCart.items);
            setCart({
              ...guestCart,
              ...totals,
            });
          } else {
            setCart(null);
          }
          toast.success("Removed from cart");
          return { success: true };
        } catch (error) {
          console.error("Error removing from guest cart:", error);
          return { success: false, error: "Failed to remove item" };
        }
      }

      // Authenticated: remove from server
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
    // Guest cart: clear localStorage
    if (!isAuthenticated) {
      try {
        clearGuestCart();
        setCart(null);
        toast.success("Cart cleared");
        return { success: true };
      } catch (error) {
        console.error("Error clearing guest cart:", error);
        return { success: false, error: "Failed to clear cart" };
      }
    }

    // Authenticated: clear server cart
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
