// services/razorpayService.js
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");
const AppError = require("../utils/appError");

class RazorpayService {
  // Create Razorpay order
  async createOrder(cart, user, shippingAddress, deliveryType = "home_delivery") {
    try {
      // Amount in paise (smallest currency unit for INR)
      const amountInPaise = Math.round(cart.total * 100);

      const options = {
        amount: amountInPaise,
        currency: process.env.CURRENCY || "INR",
        receipt: `receipt_${Date.now()}_${user._id.toString().slice(-6)}`,
        notes: {
          userId: user._id.toString(),
          cartId: cart._id.toString(),
          customerName: `${user.firstName} ${user.lastName}`,
          customerEmail: user.email,
          deliveryType: deliveryType,
          shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        },
      };

      const razorpayOrder = await razorpay.orders.create(options);

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
      };
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      throw new AppError("Failed to create payment order", 500);
    }
  }

  // Verify payment signature
  verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  ) {
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === razorpaySignature;
  }

  // Verify webhook signature
  verifyWebhookSignature(body, signature) {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

    return expectedSignature === signature;
  }

  // Process successful payment
  async processSuccessfulPayment(paymentData, cartId, userId, shippingAddress, deliveryType = "home_delivery") {
    const cart = await Cart.findById(cartId).populate("items.product");
    const user = await User.findById(userId);

    if (!cart || !user) {
      throw new AppError("Cart or user not found", 404);
    }

    // For store pickup, shipping cost should be 0
    const shippingCost = deliveryType === "store_pickup" ? 0 : cart.shipping;

    // Create order
    const order = await Order.create({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        variant: item.variant,
        name: item.name,
        image: item.image,
        size: item.size,
        weight: item.weight,
        weightUnit: item.weightUnit,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      shippingAddress: shippingAddress || null,
      billingAddress: shippingAddress || null,
      subtotal: cart.subtotal,
      discount: cart.discount,
      coupon: cart.coupon,
      shipping: {
        cost: shippingCost,
        method: deliveryType === "store_pickup" ? "pickup" : "standard",
      },
      deliveryType: deliveryType,
      tax: cart.tax,
      total: cart.total,
      payment: {
        method: "razorpay",
        status: "completed",
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: paymentData.razorpayPaymentId,
        razorpaySignature: paymentData.razorpaySignature,
        paidAt: new Date(),
      },
      status: "confirmed",
    });

    // Add status history
    order.addStatusHistory(
      "confirmed",
      "Payment completed successfully via Razorpay",
      null
    );
    await order.save();

    // Clear cart
    await Cart.findByIdAndDelete(cartId);

    // Update product stock
    for (const item of cart.items) {
      await Product.findOneAndUpdate(
        { _id: item.product._id, "variants._id": item.variant },
        {
          $inc: {
            "variants.$.stock": -item.quantity,
            soldCount: item.quantity,
          },
        }
      );
    }

    return order;
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw new AppError("Failed to fetch payment details", 500);
    }
  }

  // Get order details
  async getOrderDetails(orderId) {
    try {
      const order = await razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw new AppError("Failed to fetch order details", 500);
    }
  }

  // Create refund
  async createRefund(order, amount, reason) {
    if (!order.payment.razorpayPaymentId) {
      throw new AppError("No payment ID found for this order", 400);
    }

    try {
      // Amount in paise
      const refundAmount = amount
        ? Math.round(amount * 100)
        : Math.round(order.total * 100);

      const refund = await razorpay.payments.refund(
        order.payment.razorpayPaymentId,
        {
          amount: refundAmount,
          speed: "normal", // 'normal' or 'optimum'
          notes: {
            reason: reason || "Customer request",
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
          },
          receipt: `refund_${Date.now()}`,
        }
      );

      // Update order payment status
      const refundedAmount =
        (order.payment.refundedAmount || 0) + refund.amount / 100;

      if (refundedAmount >= order.total) {
        order.payment.status = "refunded";
        order.status = "refunded";
      } else {
        order.payment.status = "partially_refunded";
      }

      order.payment.refundedAmount = refundedAmount;
      order.payment.refundId = refund.id;
      order.addStatusHistory(
        order.payment.status,
        `Refund of ₹${(refund.amount / 100).toFixed(2)} processed. Reason: ${
          reason || "Customer request"
        }`,
        null
      );

      await order.save();

      return {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        speed: refund.speed_processed,
      };
    } catch (error) {
      console.error("Refund error:", error);
      throw new AppError(
        `Refund failed: ${error.error?.description || error.message}`,
        500
      );
    }
  }

  // Get refund status
  async getRefundStatus(paymentId, refundId) {
    try {
      const refund = await razorpay.payments.fetchRefund(paymentId, refundId);
      return refund;
    } catch (error) {
      console.error("Error fetching refund:", error);
      throw new AppError("Failed to fetch refund details", 500);
    }
  }

  // Get all refunds for a payment
  async getAllRefunds(paymentId) {
    try {
      const refunds = await razorpay.payments.fetchMultipleRefund(paymentId);
      return refunds;
    } catch (error) {
      console.error("Error fetching refunds:", error);
      throw new AppError("Failed to fetch refunds", 500);
    }
  }

  // Capture payment (for authorized payments)
  async capturePayment(paymentId, amount, currency = "INR") {
    try {
      const payment = await razorpay.payments.capture(
        paymentId,
        amount,
        currency
      );
      return payment;
    } catch (error) {
      console.error("Payment capture error:", error);
      throw new AppError("Failed to capture payment", 500);
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    const { event: eventType, payload } = event;

    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment.entity;
        console.log(`Payment captured: ${payment.id}`);

        // Payment already processed via frontend callback
        // This is for backup/verification
        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        console.log(
          `Payment failed: ${payment.id}, Reason: ${payment.error_description}`
        );

        // Log failed payment for analytics
        break;
      }

      case "refund.created": {
        const refund = payload.refund.entity;
        console.log(
          `Refund created: ${refund.id}, Amount: ${refund.amount / 100}`
        );
        break;
      }

      case "refund.processed": {
        const refund = payload.refund.entity;
        console.log(`Refund processed: ${refund.id}`);
        break;
      }

      case "refund.failed": {
        const refund = payload.refund.entity;
        console.log(`Refund failed: ${refund.id}`);
        break;
      }

      case "order.paid": {
        const order = payload.order.entity;
        console.log(`Order paid: ${order.id}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return { received: true };
  }

  // Create payment link
  async createPaymentLink(cart, user, shippingAddress, deliveryType = "home_delivery") {
    try {
      const paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(cart.total * 100),
        currency: process.env.CURRENCY || "INR",
        accept_partial: false,
        first_min_partial_amount: 0,
        description: `Order from DehydratedFoods`,
        customer: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.phone || (shippingAddress?.phone || ""),
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        notes: {
          userId: user._id.toString(),
          cartId: cart._id.toString(),
          deliveryType: deliveryType,
          shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        },
        callback_url: `${process.env.CLIENT_URL}/payment/success`,
        callback_method: "get",
        expire_by: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
      });

      return {
        paymentLinkId: paymentLink.id,
        shortUrl: paymentLink.short_url,
        amount: paymentLink.amount / 100,
        status: paymentLink.status,
      };
    } catch (error) {
      console.error("Payment link creation error:", error);
      throw new AppError("Failed to create payment link", 500);
    }
  }

  // Cancel payment link
  async cancelPaymentLink(paymentLinkId) {
    try {
      const paymentLink = await razorpay.paymentLink.cancel(paymentLinkId);
      return paymentLink;
    } catch (error) {
      console.error("Error cancelling payment link:", error);
      throw new AppError("Failed to cancel payment link", 500);
    }
  }

  // Get payment link details
  async getPaymentLinkDetails(paymentLinkId) {
    try {
      const paymentLink = await razorpay.paymentLink.fetch(paymentLinkId);
      return paymentLink;
    } catch (error) {
      console.error("Error fetching payment link:", error);
      throw new AppError("Failed to fetch payment link details", 500);
    }
  }

  // Fetch all payments with filters
  async fetchPayments(options = {}) {
    try {
      const { from, to, count = 10, skip = 0 } = options;

      const payments = await razorpay.payments.all({
        from: from ? Math.floor(new Date(from).getTime() / 1000) : undefined,
        to: to ? Math.floor(new Date(to).getTime() / 1000) : undefined,
        count,
        skip,
      });

      return payments;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw new AppError("Failed to fetch payments", 500);
    }
  }

  // Get settlements
  async fetchSettlements(options = {}) {
    try {
      const settlements = await razorpay.settlements.all(options);
      return settlements;
    } catch (error) {
      console.error("Error fetching settlements:", error);
      throw new AppError("Failed to fetch settlements", 500);
    }
  }

  // Verify VPA (UPI ID)
  async verifyVPA(vpa) {
    try {
      const result = await razorpay.payments.validateVpa({ vpa });
      return result;
    } catch (error) {
      console.error("VPA verification error:", error);
      return { success: false, customer_name: null };
    }
  }
}

module.exports = new RazorpayService();
