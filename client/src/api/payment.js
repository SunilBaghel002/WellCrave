// src/api/payment.js
import api from './axios';

export const paymentAPI = {
  getConfig: () => api.get('/payment/config'),
  
  createOrder: (data) => api.post('/payment/create-order', data),
  
  createCODOrder: (data) => api.post('/payment/create-cod-order', data),
  
  verifyPayment: (data) => api.post('/payment/verify', data),
  
  handleFailure: (data) => api.post('/payment/failure', data),
};