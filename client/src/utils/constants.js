// src/utils/constants.js
export const CURRENCY = import.meta.env.VITE_CURRENCY || "INR";
export const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "WellCrave";

export const ORDER_STATUS = {
  pending: { label: "Pending", color: "yellow" },
  confirmed: { label: "Confirmed", color: "blue" },
  processing: { label: "Processing", color: "blue" },
  shipped: { label: "Shipped", color: "purple" },
  out_for_delivery: { label: "Out for Delivery", color: "purple" },
  delivered: { label: "Delivered", color: "green" },
  cancelled: { label: "Cancelled", color: "red" },
  refunded: { label: "Refunded", color: "gray" },
  returned: { label: "Returned", color: "gray" },
};

export const PAYMENT_STATUS = {
  pending: { label: "Pending", color: "yellow" },
  processing: { label: "Processing", color: "blue" },
  completed: { label: "Completed", color: "green" },
  failed: { label: "Failed", color: "red" },
  refunded: { label: "Refunded", color: "gray" },
  partially_refunded: { label: "Partially Refunded", color: "orange" },
};

export const DIETARY_LABELS = {
  vegan: { label: "Vegan", icon: "🌱", color: "green" },
  vegetarian: { label: "Vegetarian", icon: "🥬", color: "green" },
  "gluten-free": { label: "Gluten-Free", icon: "🌾", color: "yellow" },
  "dairy-free": { label: "Dairy-Free", icon: "🥛", color: "blue" },
  organic: { label: "Organic", icon: "🌿", color: "green" },
  "non-gmo": { label: "Non-GMO", icon: "✓", color: "green" },
  keto: { label: "Keto", icon: "🥑", color: "purple" },
  paleo: { label: "Paleo", icon: "🍖", color: "orange" },
};

export const PROCESSING_METHODS = {
  "freeze-dried": "Freeze-Dried",
  "air-dried": "Air-Dried",
  "vacuum-dried": "Vacuum-Dried",
  "sun-dried": "Sun-Dried",
  "spray-dried": "Spray-Dried",
  "drum-dried": "Drum-Dried",
};

export const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "basePrice", label: "Price: Low to High" },
  { value: "-basePrice", label: "Price: High to Low" },
  { value: "-rating.average", label: "Top Rated" },
  { value: "-soldCount", label: "Best Selling" },
  { value: "name", label: "Name: A to Z" },
  { value: "-name", label: "Name: Z to A" },
];


export const PAYMENT_METHODS = {
  cod: { label: "Cash on Delivery", icon: "💵" },
  razorpay: { label: "Razorpay", icon: "💳" },
  upi: { label: "UPI", icon: "📱" },
  card: { label: "Card", icon: "💳" },
  netbanking: { label: "Net Banking", icon: "🏦" },
  wallet: { label: "Wallet", icon: "👛" },
};