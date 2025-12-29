// src/api/cart.js
import api from "./axios";

export const cartAPI = {
  get: () => api.get("/cart"),

  addItem: (data) => api.post("/cart/add", data),

  updateItem: (data) => api.put("/cart/update", data),

  removeItem: (productId, variantId) =>
    api.delete(`/cart/remove/${productId}/${variantId}`),

  clear: () => api.delete("/cart/clear"),

  applyCoupon: (code) => api.post("/cart/coupon/apply", { code }),

  removeCoupon: () => api.delete("/cart/coupon/remove"),

  validate: () => api.post("/cart/validate"),
};
