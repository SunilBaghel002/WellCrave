// src/api/auth.js
import api from "./axios";

export const authAPI = {
  register: (data) => api.post("/auth/register", data),

  login: (data) => api.post("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get("/auth/me"),

  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),

  resetPassword: (token, data) =>
    api.patch(`/auth/reset-password/${token}`, data),

  updatePassword: (data) => api.patch("/auth/update-password", data),

  verifyEmail: (token) => api.post("/auth/verify-email", { token }),

  resendVerification: () => api.post("/auth/resend-verification"),

  checkAuth: () => api.get("/auth/check"),

  googleAuth: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },

  facebookAuth: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook`;
  },
};
