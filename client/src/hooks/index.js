// src/hooks/index.js
export { useAuthActions, useProfile, useAddresses } from "./useAuth";
export { useCartActions, useLocalCart } from "./useCart";
export { useWishlistActions, useLocalWishlist } from "./useWishlist";
export {
  useProducts,
  useProduct,
  useFeaturedProducts,
  useBestSellers,
  useNewArrivals,
  useRelatedProducts,
  useProductSearch,
  useCategories,
  useCategoryTree,
  useFeaturedCategories,
} from "./useProducts";
export { useOrders, useOrder } from "./useOrders";
export {
  useProductReviews,
  useReviewActions,
  useMyReviews,
} from "./useReviews";
export { usePayment } from "./usePayment";
export { useDebounce, useDebouncedCallback } from "./useDebounce";
export { useLocalStorage } from "./useLocalStorage";
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
} from "./useMediaQuery";
export { useClickOutside } from "./useClickOutside";
export { useScrollLock } from "./useScrollLock";
