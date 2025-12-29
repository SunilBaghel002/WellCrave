// src/api/user.js
import api from "./axios";

export const userAPI = {
  getProfile: () => api.get("/users/profile"),

  updateProfile: (data) => api.put("/users/profile", data),

  updateAvatar: (formData) =>
    api.patch("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteAvatar: () => api.delete("/users/profile/avatar"),

  getAddresses: () => api.get("/users/addresses"),

  addAddress: (data) => api.post("/users/addresses", data),

  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),

  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),

  setDefaultAddress: (id) => api.patch(`/users/addresses/${id}/default`),

  getPreferences: () => api.get("/users/preferences"),

  updatePreferences: (data) => api.put("/users/preferences", data),

  deactivateAccount: (password) => api.post("/users/deactivate", { password }),
};
