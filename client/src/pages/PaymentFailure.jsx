// src/pages/PaymentFailure.jsx
import { useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  FiXCircle,
  FiRefreshCw,
  FiShoppingCart,
  FiHelpCircle,
  FiArrowLeft,
} from "react-icons/fi";
import Button from "../components/common/Button";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  const orderId = searchParams.get("order_id");

  const getErrorMessage = () => {
    switch (errorCode) {
      case "BAD_REQUEST_ERROR":
        return {
          title: "Invalid Request",
          description:
            "There was an issue with the payment request. Please try again.",
        };
      case "GATEWAY_ERROR":
        return {
          title: "Payment Gateway Error",
          description:
            "The payment gateway is temporarily unavailable. Please try again later.",
        };
      case "SERVER_ERROR":
        return {
          title: "Server Error",
          description: "We encountered a server error. Please try again.",
        };
      case "PAYMENT_CANCELLED":
        return {
          title: "Payment Cancelled",
          description:
            "You cancelled the payment. Your cart items are still saved.",
        };
      default:
        return {
          title: "Payment Failed",
          description:
            errorDescription ||
            "Something went wrong with your payment. Please try again.",
        };
    }
  };

  const errorInfo = getErrorMessage();

  const handleRetryPayment = () => {
    navigate("/checkout");
  };

  return (
    <>
      <Helmet>
        <title>Payment Failed | DehydratedFoods</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          {/* Error Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <FiXCircle className="w-14 h-14 text-red-500" />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 mb-3"
            >
              {errorInfo.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mb-8"
            >
              {errorInfo.description}
            </motion.p>
          </motion.div>

          {/* Error Details Card */}
          {(errorCode || orderId) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-left"
            >
              <h3 className="font-semibold text-gray-900 mb-4">
                Error Details
              </h3>
              <div className="space-y-3 text-sm">
                {errorCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Error Code:</span>
                    <span className="text-gray-900 font-medium">
                      {errorCode}
                    </span>
                  </div>
                )}
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="text-gray-900 font-medium">{orderId}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-left"
          >
            <h3 className="font-semibold text-yellow-900 mb-3">
              Troubleshooting Tips
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 bg-yellow-600 rounded-full flex-shrink-0"></span>
                Check your internet connection and try again
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 bg-yellow-600 rounded-full flex-shrink-0"></span>
                Ensure your payment method has sufficient balance
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 bg-yellow-600 rounded-full flex-shrink-0"></span>
                Try a different payment method
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 bg-yellow-600 rounded-full flex-shrink-0"></span>
                Contact your bank if the issue persists
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <Button
              onClick={handleRetryPayment}
              fullWidth
              leftIcon={<FiRefreshCw size={18} />}
            >
              Retry Payment
            </Button>

            <Link to="/cart">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<FiShoppingCart size={18} />}
              >
                Return to Cart
              </Button>
            </Link>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <FiHelpCircle size={18} />
              <span>Need help?</span>
              <Link
                to="/contact"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>

          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FiArrowLeft size={18} />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailure;
