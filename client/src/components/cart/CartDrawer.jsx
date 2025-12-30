// src/components/cart/CartDrawer.jsx
import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiShoppingBag,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowRight,
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/helpers";
import Button from "../common/Button";

const CartDrawer = () => {
  const drawerRef = useRef(null);
  const {
    cart,
    isLoading,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close cart when route changes
  useEffect(() => {
    if (isCartOpen) {
      closeCart();
    }
  }, [location.pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isCartOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isCartOpen, closeCart]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeCart();
    },
    [closeCart]
  );

  // Handle close button click
  const handleCloseClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeCart();
    },
    [closeCart]
  );

  // Handle checkout
  const handleCheckout = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      closeCart();

      setTimeout(() => {
        if (!isAuthenticated) {
          navigate("/login", { state: { from: { pathname: "/checkout" } } });
        } else {
          navigate("/checkout");
        }
      }, 150);
    },
    [closeCart, isAuthenticated, navigate]
  );

  // Handle quantity change
  const handleQuantityChange = useCallback(
    async (productId, variantId, newQuantity) => {
      if (newQuantity < 1) return;
      await updateQuantity(productId, variantId, newQuantity);
    },
    [updateQuantity]
  );

  // Handle remove item
  const handleRemoveItem = useCallback(
    async (productId, variantId) => {
      await removeFromCart(productId, variantId);
    },
    [removeFromCart]
  );

  // Handle continue shopping
  const handleContinueShopping = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeCart();
      setTimeout(() => {
        navigate("/shop");
      }, 150);
    },
    [closeCart, navigate]
  );

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  const drawerContent = (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <FiShoppingBag size={20} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your Cart
                  </h2>
                  <p className="text-sm text-gray-500">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseClick}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close cart"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            {isEmpty ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FiShoppingBag size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <Button onClick={handleContinueShopping}>
                  Start Shopping
                  <FiArrowRight className="ml-2" />
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {items.map((item) => {
                        const productId = item.product?._id || item.product;
                        const itemKey = `${productId}-${item.variant}`;

                        return (
                          <motion.div
                            key={itemKey}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="flex gap-4 p-4 bg-gray-50 rounded-2xl"
                          >
                            {/* Image */}
                            <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                              <img
                                src={
                                  item.image || "https://via.placeholder.com/80"
                                }
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {item.size} • {item.weight}
                                {item.weightUnit}
                              </p>
                              <p className="text-teal-600 font-semibold mt-1">
                                {formatPrice(item.price)}
                              </p>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(
                                        productId,
                                        item.variant,
                                        item.quantity - 1
                                      )
                                    }
                                    disabled={item.quantity <= 1 || isLoading}
                                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <FiMinus size={14} />
                                  </button>
                                  <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(
                                        productId,
                                        item.variant,
                                        item.quantity + 1
                                      )
                                    }
                                    disabled={isLoading}
                                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                                  >
                                    <FiPlus size={14} />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveItem(productId, item.variant)
                                  }
                                  disabled={isLoading}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                  aria-label="Remove item"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-5 bg-white flex-shrink-0">
                  {/* Price Summary */}
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(cart?.subtotal || 0)}
                      </span>
                    </div>

                    {cart?.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(cart.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium text-gray-900">
                        {cart?.shipping === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          formatPrice(cart?.shipping || 0)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax (GST)</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(cart?.tax || 0)}
                      </span>
                    </div>

                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-teal-600">
                        {formatPrice(cart?.total || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Free Shipping Progress */}
                  {cart?.subtotal < 500 && (
                    <div className="mb-5 p-3 bg-amber-50 rounded-xl">
                      <p className="text-sm text-amber-800">
                        Add{" "}
                        <strong>
                          {formatPrice(500 - (cart?.subtotal || 0))}
                        </strong>{" "}
                        more for free shipping!
                      </p>
                      <div className="mt-2 h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              ((cart?.subtotal || 0) / 500) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleCheckout}
                      fullWidth
                      size="lg"
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                    >
                      Proceed to Checkout
                      <FiArrowRight className="ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleContinueShopping}
                      fullWidth
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Use portal to render at body level
  if (typeof document !== "undefined") {
    return createPortal(drawerContent, document.body);
  }

  return null;
};

export default CartDrawer;
