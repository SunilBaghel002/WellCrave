// src/hooks/useWishlist.js
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { wishlistAPI } from "../api/wishlist";

export const useWishlistActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const moveAllToCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await wishlistAPI.moveAllToCart();
      toast.success(
        `${response.data.movedItems?.length || 0} items moved to cart`
      );

      if (response.data.failedItems?.length > 0) {
        toast.error(
          `${response.data.failedItems.length} items couldn't be moved`
        );
      }

      return { success: true, data: response.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to move items to cart";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearWishlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await wishlistAPI.clear();
      toast.success("Wishlist cleared");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to clear wishlist";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    moveAllToCart,
    clearWishlist,
  };
};

export const useLocalWishlist = () => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("guestWishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const addToLocalWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) return prev;
      const newWishlist = [...prev, productId];
      localStorage.setItem("guestWishlist", JSON.stringify(newWishlist));
      return newWishlist;
    });
  }, []);

  const removeFromLocalWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const newWishlist = prev.filter((id) => id !== productId);
      localStorage.setItem("guestWishlist", JSON.stringify(newWishlist));
      return newWishlist;
    });
  }, []);

  const isInLocalWishlist = useCallback(
    (productId) => {
      return wishlist.includes(productId);
    },
    [wishlist]
  );

  const toggleLocalWishlist = useCallback(
    (productId) => {
      if (isInLocalWishlist(productId)) {
        removeFromLocalWishlist(productId);
      } else {
        addToLocalWishlist(productId);
      }
    },
    [isInLocalWishlist, addToLocalWishlist, removeFromLocalWishlist]
  );

  const clearLocalWishlist = useCallback(() => {
    setWishlist([]);
    localStorage.removeItem("guestWishlist");
  }, []);

  return {
    wishlist,
    addToLocalWishlist,
    removeFromLocalWishlist,
    isInLocalWishlist,
    toggleLocalWishlist,
    clearLocalWishlist,
  };
};

export default useWishlistActions;
