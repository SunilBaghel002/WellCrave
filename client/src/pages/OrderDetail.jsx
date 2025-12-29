// src/pages/OrderDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiDownload,
  FiArrowLeft,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { ordersAPI } from "../api/orders";
import { formatPrice, formatDate, formatDateTime } from "../utils/helpers";
import { ORDER_STATUS, PAYMENT_STATUS } from "../utils/constants";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Loader from "../components/common/Loader";
import Modal from "../components/common/Modal";
import toast from "react-hot-toast";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const { data } = await ordersAPI.getById(id);
      setOrder(data.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      setIsCancelling(true);
      await ordersAPI.cancel(id, cancelReason);
      toast.success("Order cancelled successfully");
      setIsCancelModalOpen(false);
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-yellow-500" />;
      case "confirmed":
      case "processing":
        return <FiPackage className="text-blue-500" />;
      case "shipped":
      case "out_for_delivery":
        return <FiTruck className="text-purple-500" />;
      case "delivered":
        return <FiCheckCircle className="text-green-500" />;
      case "cancelled":
      case "refunded":
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  const canBeCancelled = () => {
    const nonCancellableStatuses = [
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
    ];
    return !nonCancellableStatuses.includes(order?.status);
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">Order not found</p>
          <Link to="/orders">
            <Button variant="outline" className="mt-4">
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS[order.status] || {
    label: order.status,
    color: "gray",
  };

  // Order timeline steps
  const timelineSteps = [
    { status: "pending", label: "Order Placed", icon: FiClock },
    { status: "confirmed", label: "Confirmed", icon: FiCheckCircle },
    { status: "processing", label: "Processing", icon: FiPackage },
    { status: "shipped", label: "Shipped", icon: FiTruck },
    { status: "delivered", label: "Delivered", icon: FiCheckCircle },
  ];

  const getCurrentStepIndex = () => {
    if (order.status === "cancelled" || order.status === "refunded") return -1;
    return timelineSteps.findIndex((step) => step.status === order.status);
  };

  return (
    <>
      <Helmet>
        <title>Order {order.orderNumber} | DehydratedFoods</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom">
          {/* Back Button */}
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
          >
            <FiArrowLeft size={18} />
            Back to Orders
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-card p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <h1 className="text-2xl font-bold text-gray-900">
                        {order.orderNumber}
                      </h1>
                      <Badge
                        variant={
                          statusInfo.color === "green"
                            ? "success"
                            : statusInfo.color === "red"
                            ? "error"
                            : statusInfo.color === "yellow"
                            ? "warning"
                            : "info"
                        }
                      >
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-gray-500">
                      Placed on {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  {canBeCancelled() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Order Timeline */}
              {order.status !== "cancelled" && order.status !== "refunded" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-card p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Order Timeline
                  </h2>
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                    {timelineSteps.map((step, index) => {
                      const currentIndex = getCurrentStepIndex();
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div
                          key={step.status}
                          className="relative flex items-start mb-6 last:mb-0"
                        >
                          <div
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? "bg-primary-600 text-white"
                                : "bg-gray-200 text-gray-400"
                            } ${isCurrent ? "ring-4 ring-primary-100" : ""}`}
                          >
                            <step.icon size={20} />
                          </div>
                          <div className="ml-4 pt-2">
                            <p
                              className={`font-medium ${
                                isCompleted ? "text-gray-900" : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </p>
                            {order.statusHistory?.find(
                              (h) => h.status === step.status
                            ) && (
                              <p className="text-sm text-gray-500">
                                {formatDateTime(
                                  order.statusHistory.find(
                                    (h) => h.status === step.status
                                  ).timestamp
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Cancelled/Refunded Notice */}
              {(order.status === "cancelled" ||
                order.status === "refunded") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-2xl p-6 ${
                    order.status === "cancelled"
                      ? "bg-red-50 border border-red-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <FiAlertCircle
                      className={
                        order.status === "cancelled"
                          ? "text-red-500"
                          : "text-gray-500"
                      }
                      size={24}
                    />
                    <div>
                      <h3
                        className={`font-semibold ${
                          order.status === "cancelled"
                            ? "text-red-900"
                            : "text-gray-900"
                        }`}
                      >
                        Order{" "}
                        {order.status === "cancelled"
                          ? "Cancelled"
                          : "Refunded"}
                      </h3>
                      {order.cancellationReason && (
                        <p className="text-sm text-gray-600 mt-1">
                          Reason: {order.cancellationReason}
                        </p>
                      )}
                      {order.cancelledAt && (
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDateTime(order.cancelledAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-card p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Items ({order.items?.length})
                </h2>
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, index) => (
                    <div key={index} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex gap-4">
                        <Link
                          to={`/product/${item.product}`}
                          className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product}`}
                            className="font-medium text-gray-900 hover:text-primary-600"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            Size: {item.size} • {item.weight}
                            {item.weightUnit}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                            <p className="font-medium text-gray-900">
                              {formatPrice(item.total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-card p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {order.shipping?.cost === 0
                        ? "Free"
                        : formatPrice(order.shipping?.cost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-card p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-medium">Razorpay</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge
                      variant={
                        order.payment?.status === "completed"
                          ? "success"
                          : "warning"
                      }
                    >
                      {PAYMENT_STATUS[order.payment?.status]?.label ||
                        order.payment?.status}
                    </Badge>
                  </div>
                  {order.payment?.razorpayPaymentId && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Payment ID</p>
                      <p className="text-sm font-mono text-gray-700 break-all">
                        {order.payment.razorpayPaymentId}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-card p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress?.firstName}{" "}
                    {order.shippingAddress?.lastName}
                  </p>
                  <p>{order.shippingAddress?.street}</p>
                  {order.shippingAddress?.apartment && (
                    <p>{order.shippingAddress.apartment}</p>
                  )}
                  <p>
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}{" "}
                    {order.shippingAddress?.zipCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <p className="flex items-center gap-2">
                      <FiPhone size={16} />
                      {order.shippingAddress?.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <FiMail size={16} />
                      {order.shippingAddress?.email}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Tracking Info */}
              {order.tracking?.trackingNumber && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-2xl shadow-card p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Tracking Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Carrier</p>
                      <p className="font-medium">{order.tracking.carrier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tracking Number</p>
                      <p className="font-mono text-sm">
                        {order.tracking.trackingNumber}
                      </p>
                    </div>
                    {order.tracking.trackingUrl && (
                      <a
                        href={order.tracking.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          className="mt-2"
                        >
                          Track Package
                        </Button>
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Need Help */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Having issues with your order? Contact our support team.
                </p>
                <Link to="/contact">
                  <Button variant="outline" size="sm" fullWidth>
                    Contact Support
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please tell us why you're cancelling..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelOrder}
              isLoading={isCancelling}
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default OrderDetail;
