// src/api/wishlist.js
import api from "./axios";

export const wishlistAPI = {
  get: () => api.get("/wishlist"),

  add: (data) => api.post("/wishlist/add", data),

  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),

  clear: () => api.delete("/wishlist/clear"),

  moveToCart: (productId, data) =>
    api.post(`/wishlist/move-to-cart/${productId}`, data),

  moveAllToCart: () => api.post("/wishlist/move-all-to-cart"),

  check: (productId) => api.get(`/wishlist/check/${productId}`),
};
