// src/components/checkout/OrderSummary.jsx
import { formatPrice } from "../../utils/helpers";

const OrderSummary = ({ cart, className = "" }) => {
  if (!cart) return null;

  const { items, subtotal, discount, shipping, tax, total, coupon } = cart;

  return (
    <div className={`bg-gray-50 rounded-2xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h3>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.product}-${item.variant}`} className="flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">{item.size}</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">
              Discount {coupon?.code && `(${coupon.code})`}
            </span>
            <span className="text-green-600">-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? "FREE" : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (GST)</span>
          <span className="text-gray-900">{formatPrice(tax)}</span>
        </div>

        <div className="flex justify-between pt-3 border-t border-gray-200">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
