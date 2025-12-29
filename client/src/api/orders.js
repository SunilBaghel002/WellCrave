// src/api/orders.js
import api from "./axios";

export const ordersAPI = {
  getMyOrders: (params) => api.get("/orders", { params }),

  getById: (id) => api.get(`/orders/${id}`),

  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),

  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),

  requestReturn: (id, reason) => api.post(`/orders/${id}/return`, { reason }),
};
