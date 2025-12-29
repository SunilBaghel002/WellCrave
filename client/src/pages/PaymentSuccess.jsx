// src/pages/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  FiCheckCircle,
  FiPackage,
  FiMail,
  FiArrowRight,
  FiHome,
} from "react-icons/fi";
import confetti from "canvas-confetti";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { ordersAPI } from "../api/orders";
import { formatPrice, formatDate } from "../utils/helpers";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = searchParams.get("order_id");
  const orderNumber = searchParams.get("order_number");

  useEffect(() => {
    // Trigger confetti animation
    const triggerConfetti = () => {
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ["#22c55e", "#16a34a", "#fbbf24", "#f59e0b"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    };

    triggerConfetti();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId && !orderNumber) {
        setError("No order information found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let response;

        if (orderId) {
          response = await ordersAPI.getById(orderId);
        } else if (orderNumber) {
          response = await ordersAPI.getByNumber(orderNumber);
        }

        setOrder(response.data.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, orderNumber]);

  if (isLoading) {
    return <Loader fullScreen text="Loading order details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiPackage className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order Confirmed | DehydratedFoods</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <FiCheckCircle className="w-14 h-14 text-green-500" />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
            >
              Payment Successful! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600"
            >
              Thank you for your order. We've received your payment.
            </motion.p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
          >
            {/* Order Header */}
            <div className="bg-primary-600 text-white p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-primary-100 text-sm mb-1">Order Number</p>
                  <p className="text-2xl font-bold">{order?.orderNumber}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-primary-100 text-sm mb-1">Order Date</p>
                  <p className="font-medium">{formatDate(order?.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order?.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order?.subtotal)}</span>
                </div>
                {order?.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order?.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {order?.shipping?.cost === 0
                      ? "Free"
                      : formatPrice(order?.shipping?.cost)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST)</span>
                  <span>{formatPrice(order?.tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total Paid</span>
                    <span className="text-primary-600">
                      {formatPrice(order?.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">
                Shipping Address
              </h3>
              <div className="text-gray-600">
                <p className="font-medium text-gray-900">
                  {order?.shippingAddress?.firstName}{" "}
                  {order?.shippingAddress?.lastName}
                </p>
                <p>{order?.shippingAddress?.street}</p>
                {order?.shippingAddress?.apartment && (
                  <p>{order?.shippingAddress?.apartment}</p>
                )}
                <p>
                  {order?.shippingAddress?.city},{" "}
                  {order?.shippingAddress?.state}{" "}
                  {order?.shippingAddress?.zipCode}
                </p>
                <p>{order?.shippingAddress?.country}</p>
                <p className="mt-2">{order?.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">
                Payment Information
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">RP</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Paid via Razorpay</p>
                  <p className="text-sm text-gray-500">
                    Payment ID: {order?.payment?.razorpayPaymentId}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Email Confirmation Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8"
          >
            <div className="flex items-start gap-3">
              <FiMail className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  Confirmation email sent
                </p>
                <p className="text-sm text-blue-700">
                  We've sent order confirmation and receipt to your email
                  address.
                </p>
              </div>
            </div>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h3 className="font-semibold text-gray-900 mb-4">
              What happens next?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Processing</p>
                  <p className="text-sm text-gray-600">
                    We're preparing your order for shipment. This usually takes
                    1-2 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shipping</p>
                  <p className="text-sm text-gray-600">
                    Once shipped, you'll receive a tracking number via email.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Delivery</p>
                  <p className="text-sm text-gray-600">
                    Your package will be delivered to your doorstep. Enjoy your
                    healthy treats!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to={`/orders/${order?._id}`} className="flex-1">
              <Button fullWidth leftIcon={<FiPackage size={18} />}>
                Track Order
              </Button>
            </Link>
            <Link to="/shop" className="flex-1">
              <Button
                variant="outline"
                fullWidth
                rightIcon={<FiArrowRight size={18} />}
              >
                Continue Shopping
              </Button>
            </Link>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center mt-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FiHome size={18} />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
