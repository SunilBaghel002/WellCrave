// src/api/orders.js
import api from "./axios";

export const ordersAPI = {
  // Get all orders for the logged-in user
  getMyOrders: (params) => api.get("/orders/my-orders", { params }),

  // Get single order by ID
  getById: (id) => api.get(`/orders/${id}`),

  // Get order by order number
  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),

  // Cancel order
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),

  // Request return
  requestReturn: (id, data) => api.post(`/orders/${id}/return`, data),

  // Track order
  track: (id) => api.get(`/orders/${id}/track`),

  // Download invoice
  downloadInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
};

export default ordersAPI;