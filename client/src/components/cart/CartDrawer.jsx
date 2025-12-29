// src/components/cart/CartDrawer.jsx
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/helpers";
import CartItem from "./CartItem";
import Button from "../common/Button";
import Loader from "../common/Loader";

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, isLoading, clearCart } = useCart();

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FiShoppingBag size={20} className="text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Shopping Cart
                </h2>
                {cart?.items?.length > 0 && (
                  <span className="bg-primary-100 text-primary-600 text-sm font-medium px-2 py-0.5 rounded-full">
                    {cart.items.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader />
                </div>
              ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiShoppingBag size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <Link to="/shop" onClick={onClose}>
                    <Button>
                      Start Shopping
                      <FiArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="px-6 divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <CartItem
                      key={`${item.product}-${item.variant}`}
                      item={item}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isEmpty && (
              <div className="border-t border-gray-200 px-6 py-4 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  <Link to="/checkout" onClick={onClose}>
                    <Button fullWidth size="lg">
                      Checkout
                    </Button>
                  </Link>

                  <Link to="/cart" onClick={onClose}>
                    <Button variant="outline" fullWidth>
                      View Cart
                    </Button>
                  </Link>
                </div>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
