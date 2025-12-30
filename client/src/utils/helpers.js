// src/utils/helpers.js
import { CURRENCY_SYMBOL } from "./constants";

export const formatPrice = (price, showSymbol = true) => {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  return showSymbol ? `${CURRENCY_SYMBOL}${formatted}` : formatted;
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Date(date).toLocaleDateString("en-IN", defaultOptions);
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(date);
};

export const truncate = (str, length = 100) => {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
};

export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getDiscountPercentage = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const getStockStatus = (stock, threshold = 10) => {
  if (stock === 0)
    return { status: "out-of-stock", label: "Out of Stock", color: "red" };
  if (stock <= threshold)
    return {
      status: "low-stock",
      label: `Only ${stock} left`,
      color: "yellow",
    };
  return { status: "in-stock", label: "In Stock", color: "green" };
};

export const generateRatingStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return { fullStars, hasHalfStar, emptyStars };
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ""}${
    lastName?.charAt(0) || ""
  }`.toUpperCase();
};

export const parseQueryParams = (searchParams) => {
  const params = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return params;
};

export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

export const getRelativeTime = (date) => {
  if (!date) return "";
  
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
};
