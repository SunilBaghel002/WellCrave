// src/hooks/usePayment.js
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { paymentAPI } from "../api/payment";

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [razorpayConfig, setRazorpayConfig] = useState(null);

  const loadRazorpayConfig = useCallback(async () => {
    try {
      const response = await paymentAPI.getConfig();
      setRazorpayConfig(response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to load Razorpay config:", err);
      return null;
    }
  }, []);

  const createOrder = useCallback(async (shippingAddress) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentAPI.createOrder({ shippingAddress });
      return { success: true, data: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create order";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyPayment = useCallback(async (paymentData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentAPI.verifyPayment(paymentData);
      return { success: true, data: response.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Payment verification failed";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePaymentFailure = useCallback(async (data) => {
    try {
      await paymentAPI.handleFailure(data);
    } catch (err) {
      console.error("Failed to log payment failure:", err);
    }
  }, []);

  const initiatePayment = useCallback(
    async (orderData, userInfo, onSuccess, onFailure) => {
      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded. Please refresh the page.");
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "DehydratedFoods",
        description: "Premium Dehydrated Foods",
        image: "/logo.png",
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone,
        },
        notes: orderData.notes || {},
        theme: {
          color: "#16a34a",
        },
        handler: async (response) => {
          const result = await verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            cartId: orderData.cartId,
            shippingAddress: JSON.parse(
              orderData.notes?.shippingAddress || "{}"
            ),
          });

          if (result.success) {
            onSuccess?.(result.data);
          } else {
            onFailure?.(result.error);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            onFailure?.("Payment cancelled by user");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        handlePaymentFailure({
          razorpayOrderId: orderData.orderId,
          error: response.error,
        });

        toast.error(response.error?.description || "Payment failed");
        onFailure?.(response.error);
      });

      razorpay.open();
    },
    [verifyPayment, handlePaymentFailure]
  );

  return {
    isLoading,
    error,
    razorpayConfig,
    loadRazorpayConfig,
    createOrder,
    verifyPayment,
    initiatePayment,
  };
};

export default usePayment;
