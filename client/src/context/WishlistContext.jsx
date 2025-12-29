// src/context/WishlistContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { wishlistAPI } from "../api/wishlist";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist(null);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const { data } = await wishlistAPI.get();
      setWishlist(data.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = useCallback(async (productId, variantId = null) => {
    try {
      setIsLoading(true);
      const { data } = await wishlistAPI.add({ productId, variantId });
      setWishlist(data.data);
      toast.success("Added to wishlist!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to add to wishlist";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setIsLoading(true);
      const { data } = await wishlistAPI.remove(productId);
      setWishlist(data.data);
      toast.success("Removed from wishlist");
      return { success: true };
    } catch (error) {
      toast.error("Failed to remove from wishlist");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isInWishlist = useCallback(
    (productId) => {
      return (
        wishlist?.products?.some((item) => item.product?._id === productId) ||
        false
      );
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (productId, variantId = null) => {
      if (isInWishlist(productId)) {
        return removeFromWishlist(productId);
      } else {
        return addToWishlist(productId, variantId);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  const moveToCart = useCallback(async (productId, variantId, quantity = 1) => {
    try {
      setIsLoading(true);
      const { data } = await wishlistAPI.moveToCart(productId, {
        variantId,
        quantity,
      });
      setWishlist(data.data.wishlist);
      toast.success("Moved to cart!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to move to cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const itemCount = wishlist?.products?.length || 0;

  const value = {
    wishlist,
    isLoading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    moveToCart,
    itemCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export default WishlistContext;
