// src/api/products.js
import api from "./axios";

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),

  getById: (id) => api.get(`/products/${id}`),

  getBySlug: (slug) => api.get(`/products/slug/${slug}`),

  getFeatured: () => api.get("/products/featured"),

  getBestSellers: () => api.get("/products/best-sellers"),

  getNewArrivals: () => api.get("/products/new-arrivals"),

  getRelated: (id) => api.get(`/products/${id}/related`),

  search: (query) => api.get("/products/search", { params: { search: query } }),

  getFilters: () => api.get("/products/filters"),
};

export const categoriesAPI = {
  getAll: () => api.get("/categories"),

  getTree: () => api.get("/categories/tree"),

  getFeatured: () => api.get("/categories/featured"),

  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),

  getProducts: (id, params) =>
    api.get(`/categories/${id}/products`, { params }),
};
