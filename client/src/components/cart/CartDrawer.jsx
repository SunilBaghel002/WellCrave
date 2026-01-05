// src/components/cart/CartDrawer.jsx
import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShoppingBag, FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/helpers";
import Button from "../common/Button";

const CartDrawer = ({ isOpen, onClose }) => {
  const drawerRef = useRef(null);
  const { cart, isLoading, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close cart drawer when navigating to checkout
  useEffect(() => {
    if (location.pathname === "/checkout" && isOpen) {
      onClose();
    }
  }, [location.pathname, isOpen, onClose]);

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      // Cart is already saved in localStorage for guest users
      // Redirect to login with checkout as the destination
      navigate("/login", { 
        state: { from: { pathname: "/checkout" } },
        search: "?redirect=/checkout"
      });
    } else {
      navigate("/checkout");
    }
  };

  const handleQuantityChange = async (productId, variantId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, variantId, newQuantity);
  };

  const handleRemoveItem = async (productId, variantId) => {
    await removeFromCart(productId, variantId);
  };

  const handleContinueShopping = () => {
    onClose();
    navigate("/shop");
  };

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FiShoppingBag size={24} className="text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Cart ({items.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                <Button onClick={handleContinueShopping}>Start Shopping</Button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.product?._id || item.product}-${
                          item.variant
                        }`}
                        className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || "https://via.placeholder.com/80"}
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
                          <p className="text-primary-600 font-semibold mt-1">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product?._id || item.product,
                                    item.variant,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1 || isLoading}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiMinus size={14} />
                              </button>
                              <span className="px-3 text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product?._id || item.product,
                                    item.variant,
                                    item.quantity + 1
                                  )
                                }
                                disabled={isLoading}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                handleRemoveItem(
                                  item.product?._id || item.product,
                                  item.variant
                                )
                              }
                              disabled={isLoading}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-white">
                  {/* Subtotal */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">
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
                      <span className="font-medium">
                        {cart?.shipping === 0
                          ? "FREE"
                          : formatPrice(cart?.shipping || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax (GST)</span>
                      <span className="font-medium">
                        {formatPrice(cart?.tax || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-primary-600">
                        {formatPrice(cart?.total || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button onClick={handleCheckout} fullWidth size="lg">
                      Proceed to Checkout
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
};

export default CartDrawer;
