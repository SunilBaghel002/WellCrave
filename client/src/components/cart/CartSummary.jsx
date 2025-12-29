// src/components/cart/CartSummary.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { FiTag, FiX, FiTruck, FiShield } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/helpers";
import Button from "../common/Button";
import Input from "../common/Input";

const CartSummary = ({ showCheckoutButton = true, className = "" }) => {
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const { cart, applyCoupon, removeCoupon, isLoading } = useCart();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    await applyCoupon(couponCode);
    setIsApplyingCoupon(false);
    setCouponCode("");
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
  };

  if (!cart) return null;

  const { subtotal, discount, shipping, tax, total, coupon } = cart;
  const freeShippingThreshold = 500;
  const remainingForFreeShipping = freeShippingThreshold - subtotal;

  return (
    <div className={clsx("bg-white rounded-2xl p-6 shadow-card", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Order Summary
      </h3>

      {/* Free Shipping Progress */}
      {remainingForFreeShipping > 0 && (
        <div className="mb-6 p-4 bg-primary-50 rounded-xl">
          <div className="flex items-center gap-2 text-primary-700 mb-2">
            <FiTruck size={18} />
            <span className="text-sm font-medium">
              Add {formatPrice(remainingForFreeShipping)} more for FREE
              shipping!
            </span>
          </div>
          <div className="w-full bg-primary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  (subtotal / freeShippingThreshold) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Coupon Code */}
      {!coupon?.code ? (
        <form onSubmit={handleApplyCoupon} className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              leftIcon={<FiTag size={18} />}
              containerClassName="flex-1"
            />
            <Button
              type="submit"
              variant="outline"
              isLoading={isApplyingCoupon}
              disabled={!couponCode.trim()}
            >
              Apply
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiTag className="text-green-600" size={18} />
            <span className="text-green-700 font-medium">{coupon.code}</span>
            <span className="text-green-600 text-sm">
              (-{formatPrice(discount)})
            </span>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-green-600 hover:text-green-700"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Tax (GST 18%)</span>
          <span>{formatPrice(tax)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <Link to="/checkout">
          <Button
            fullWidth
            size="lg"
            disabled={isLoading || cart.items.length === 0}
          >
            Proceed to Checkout
          </Button>
        </Link>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <FiShield size={16} />
          <span>Secure checkout with Razorpay</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <FiTruck size={16} />
          <span>Free shipping on orders above ₹500</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
