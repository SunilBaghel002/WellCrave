// src/api/reviews.js
import api from './axios';

export const reviewsAPI = {
  getProductReviews: (productId, params) => 
    api.get(`/reviews/product/${productId}`, { params }),
  
  getProductStats: (productId) => 
    api.get(`/reviews/product/${productId}/stats`),
  
  create: (data) => api.post('/reviews', data),
  
  update: (id, data) => api.put(`/reviews/${id}`, data),
  
  delete: (id) => api.delete(`/reviews/${id}`),
  
  vote: (id, vote) => api.post(`/reviews/${id}/vote`, { vote }),
  
  report: (id, reason) => api.post(`/reviews/${id}/report`, { reason }),
  
  getMyReviews: () => api.get('/reviews/user/me'),
};