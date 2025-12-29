// src/pages/Cart.jsx
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import { APP_NAME } from "../utils/constants";

const Cart = () => {
  const { cart, isLoading } = useCart();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <>
      <Helmet>
        <title>Shopping Cart - {APP_NAME}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              Shopping Cart
            </h1>
            <Link
              to="/shop"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <FiArrowLeft size={18} />
              Continue Shopping
            </Link>
          </div>

          {isEmpty ? (
            <EmptyState
              icon={<FiShoppingBag size={48} />}
              title="Your cart is empty"
              description="Looks like you haven't added anything to your cart yet. Start shopping to fill it up!"
              actionLabel="Start Shopping"
              actionLink="/shop"
            />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">
                      Cart Items ({cart.items.length})
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {cart.items.map((item) => (
                      <CartItem
                        key={`${item.product}-${item.variant}`}
                        item={item}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CartSummary />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
