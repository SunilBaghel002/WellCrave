// src/api/cart.js
import api from "./axios";

export const cartAPI = {
  // Get current cart
  get: () => api.get("/cart"),

  // Add item to cart
  addItem: (data) => api.post("/cart/add", data),

  // Update item quantity
  updateItem: (data) => api.put("/cart/update", data),

  // Remove item from cart
  removeItem: (productId, variantId) =>
    api.delete(`/cart/remove/${productId}/${variantId}`),

  // Clear entire cart
  clear: () => api.delete("/cart/clear"),

  // Apply coupon
  applyCoupon: (code) => api.post("/cart/coupon/apply", { code }),

  // Remove coupon
  removeCoupon: () => api.delete("/cart/coupon/remove"),

  // Get cart summary (for checkout)
  getSummary: () => api.get("/cart/summary"),
};

export default cartAPI;
