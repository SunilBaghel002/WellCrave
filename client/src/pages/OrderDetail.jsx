// src/pages/OrderDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  FiPackage,
  FiArrowLeft,
  FiTruck,
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiDownload,
  FiCopy,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { ordersAPI } from "../api/orders";
import { formatPrice, formatDate, formatDateTime } from "../utils/helpers";
import { ORDER_STATUS, PAYMENT_METHODS, APP_NAME } from "../utils/constants";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";

// Status Timeline Component
const OrderTimeline = ({ order }) => {
  const steps = [
    { key: "pending", label: "Order Placed", icon: FiClock },
    { key: "confirmed", label: "Confirmed", icon: FiCheckCircle },
    { key: "processing", label: "Processing", icon: FiPackage },
    { key: "shipped", label: "Shipped", icon: FiTruck },
    { key: "delivered", label: "Delivered", icon: FiCheckCircle },
  ];

  const statusOrder = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];
  const currentIndex = statusOrder.indexOf(order.status);

  // Handle cancelled/refunded orders differently
  if (["cancelled", "refunded", "returned"].includes(order.status)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <FiXCircle className="text-red-500" size={24} />
          <div>
            <p className="font-medium text-red-800">
              Order {ORDER_STATUS[order.status]?.label || order.status}
            </p>
            {order.cancelledAt && (
              <p className="text-sm text-red-600">
                on {formatDateTime(order.cancelledAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentIndex >= statusOrder.indexOf(step.key);
          const isCurrent = order.status === step.key;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Connector Line */}
              {index > 0 && (
                <div
                  className={`absolute h-1 top-5 -z-10 ${
                    isCompleted ? "bg-teal-500" : "bg-gray-200"
                  }`}
                  style={{
                    left: `${
                      (100 / (steps.length - 1)) * (index - 1) +
                      50 / (steps.length - 1)
                    }%`,
                    width: `${
                      100 / (steps.length - 1) - 100 / (steps.length - 1) / 2
                    }%`,
                  }}
                />
              )}

              {/* Step Circle */}
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 text-gray-400"
                } ${isCurrent ? "ring-4 ring-teal-200" : ""}`}
              >
                <Icon size={18} />
              </div>

              {/* Label */}
              <p
                className={`mt-2 text-xs font-medium text-center ${
                  isCompleted ? "text-teal-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const { data } = await ordersAPI.getById(orderId);
        setOrder(data.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(
          err.response?.data?.message || "Failed to fetch order details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    toast.success("Order number copied!");
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      setIsCancelling(true);
      const { data } = await ordersAPI.cancel(orderId, cancelReason);
      setOrder(data.data);
      setShowCancelModal(false);
      toast.success("Order cancelled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = order && ["pending", "confirmed"].includes(order.status);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <FiAlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-500 mb-6">{error || "Order not found"}</p>
          <Link to="/orders">
            <Button>
              <FiArrowLeft className="mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          Order {order.orderNumber} | {APP_NAME}
        </title>
      </Helmet>

      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-24 pb-12">
        <div className="container-custom max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              <FiArrowLeft />
              <span>Back to Orders</span>
            </button>
          </motion.div>

          {/* Order Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {order.orderNumber}
                  </h1>
                  <button
                    onClick={handleCopyOrderNumber}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy order number"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
                <p className="text-gray-500">
                  Placed on {formatDateTime(order.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(true)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <OrderTimeline order={order} />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiPackage className="text-teal-600" />
                  Order Items ({order.items?.length})
                </h2>

                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "https://via.placeholder.com/80"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product}`}
                          className="font-medium text-gray-900 hover:text-teal-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {item.size} • {item.weight}
                          {item.weightUnit}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMapPin className="text-teal-600" />
                  Shipping Address
                </h2>

                {order.shippingAddress && (
                  <div className="text-gray-600">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.pincode}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
                      <p className="flex items-center gap-2 text-sm">
                        <FiPhone size={14} />
                        {order.shippingAddress.phone}
                      </p>
                      {order.shippingAddress.email && (
                        <p className="flex items-center gap-2 text-sm">
                          <FiMail size={14} />
                          {order.shippingAddress.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">
                      {order.shipping === 0
                        ? "FREE"
                        : formatPrice(order.shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-900">
                      {formatPrice(order.tax)}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-teal-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Payment Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-teal-600" />
                  Payment
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="text-gray-900">
                      {PAYMENT_METHODS[order.paymentMethod]?.label ||
                        order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : order.paymentStatus === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.paymentStatus?.charAt(0).toUpperCase() +
                        order.paymentStatus?.slice(1)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Tracking Info */}
              {order.tracking && order.status === "shipped" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiTruck className="text-teal-600" />
                    Tracking
                  </h2>

                  <div className="space-y-2 text-sm">
                    {order.tracking.carrier && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Carrier</span>
                        <span className="text-gray-900">
                          {order.tracking.carrier}
                        </span>
                      </div>
                    )}
                    {order.tracking.trackingNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Tracking #</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              order.tracking.trackingNumber
                            );
                            toast.success("Tracking number copied!");
                          }}
                          className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                        >
                          {order.tracking.trackingNumber}
                          <FiCopy size={12} />
                        </button>
                      </div>
                    )}
                    {order.tracking.estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expected</span>
                        <span className="text-gray-900">
                          {formatDate(order.tracking.estimatedDelivery)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Need Help */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about your order? We're here to help!
                </p>
                <Link to="/contact">
                  <Button variant="outline" fullWidth size="sm">
                    Contact Support
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Cancel Order
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please tell us why you're cancelling..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCancelModal(false)}
              >
                Keep Order
              </Button>
              <Button
                fullWidth
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="bg-red-600 hover:bg-red-700"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default OrderDetail;
