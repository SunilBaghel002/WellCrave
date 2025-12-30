// controllers/paymentController.js
const razorpayService = require("../services/razorpayService");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const User = require("../models/User");
const emailService = require("../services/emailService");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create Razorpay order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress, deliveryType = "home_delivery" } = req.body;

  // Validate delivery type
  if (!["home_delivery", "store_pickup"].includes(deliveryType)) {
    return next(new AppError("Invalid delivery type", 400));
  }

  // Shipping address is required only for home delivery
  if (deliveryType === "home_delivery" && !shippingAddress) {
    return next(new AppError("Shipping address is required for home delivery", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  // Validate cart items are still available
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      return next(
        new AppError(`Product "${item.name}" is no longer available`, 400)
      );
    }

    const variant = item.product.variants.id(item.variant);
    if (!variant || variant.stock < item.quantity) {
      return next(
        new AppError(`"${item.name}" does not have sufficient stock`, 400)
      );
    }
  }

  // Create Razorpay order
  const razorpayOrder = await razorpayService.createOrder(
    cart,
    req.user,
    shippingAddress,
    deliveryType
  );

  res.status(200).json({
    success: true,
    data: {
      orderId: razorpayOrder.orderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      cartId: cart._id,
      user: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: req.user.phone || shippingAddress.phone,
      },
      prefill: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        email: req.user.email,
        contact: shippingAddress.phone,
      },
      notes: {
        shippingAddress: JSON.stringify(shippingAddress),
      },
    },
  });
});

// Verify payment and create order
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    cartId,
    shippingAddress,
    deliveryType = "home_delivery",
  } = req.body;

  // Verify signature
  const isValid = razorpayService.verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    return next(
      new AppError("Payment verification failed. Invalid signature.", 400)
    );
  }

  // Get payment details from Razorpay
  const paymentDetails = await razorpayService.getPaymentDetails(
    razorpayPaymentId
  );

  if (paymentDetails.status !== "captured") {
    return next(new AppError("Payment not captured", 400));
  }

  // Process the payment and create order
  const order = await razorpayService.processSuccessfulPayment(
    {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    },
    cartId,
    req.user._id,
    shippingAddress,
    deliveryType
  );

  // Send confirmation email
  try {
    await emailService.sendOrderConfirmation(order, req.user);
  } catch (emailError) {
    console.error("Failed to send order confirmation email:", emailError);
  }

  res.status(200).json({
    success: true,
    message: "Payment verified and order created successfully",
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
    },
  });
});

// Handle payment failure
exports.handlePaymentFailure = catchAsync(async (req, res) => {
  const { razorpayOrderId, error } = req.body;

  console.log(`Payment failed for order ${razorpayOrderId}:`, error);

  res.status(200).json({
    success: false,
    message: "Payment failed",
    error: error?.description || "Payment could not be processed",
  });
});

// Get payment details
exports.getPaymentDetails = catchAsync(async (req, res, next) => {
  const { paymentId } = req.params;

  const payment = await razorpayService.getPaymentDetails(paymentId);

  res.json({
    success: true,
    data: payment,
  });
});

// Create payment link
exports.createPaymentLink = catchAsync(async (req, res, next) => {
  const { shippingAddress, deliveryType = "home_delivery" } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  const paymentLink = await razorpayService.createPaymentLink(
    cart,
    req.user,
    shippingAddress,
    deliveryType
  );

  res.status(200).json({
    success: true,
    data: paymentLink,
  });
});

// Handle webhook
exports.handleWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    return next(new AppError("No signature provided", 400));
  }

  // Verify webhook signature
  const isValid = razorpayService.verifyWebhookSignature(req.body, signature);

  if (!isValid) {
    return next(new AppError("Invalid webhook signature", 400));
  }

  // Handle the event
  const result = await razorpayService.handleWebhookEvent(req.body);

  res.json(result);
});

// Get Razorpay config (public key)
exports.getConfig = (req, res) => {
  res.json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID,
    currency: process.env.CURRENCY || "INR",
  });
};

// Initiate refund
exports.initiateRefund = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { amount, reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check if order belongs to user (unless admin)
  if (
    req.user.role !== "admin" &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("Not authorized to refund this order", 403));
  }

  if (order.payment.status === "refunded") {
    return next(new AppError("Order has already been fully refunded", 400));
  }

  const refund = await razorpayService.createRefund(order, amount, reason);

  res.json({
    success: true,
    message: "Refund initiated successfully",
    data: refund,
  });
});

// Get refund status
exports.getRefundStatus = catchAsync(async (req, res, next) => {
  const { paymentId, refundId } = req.params;

  const refund = await razorpayService.getRefundStatus(paymentId, refundId);

  res.json({
    success: true,
    data: refund,
  });
});

// Verify VPA (UPI)
exports.verifyVPA = catchAsync(async (req, res) => {
  const { vpa } = req.body;

  const result = await razorpayService.verifyVPA(vpa);

  res.json({
    success: true,
    data: result,
  });
});

// Get all payments (Admin)
exports.getAllPayments = catchAsync(async (req, res) => {
  const { from, to, count, skip } = req.query;

  const payments = await razorpayService.fetchPayments({
    from,
    to,
    count: parseInt(count) || 10,
    skip: parseInt(skip) || 0,
  });

  res.json({
    success: true,
    data: payments,
  });
});

// Retry payment for failed order
exports.retryPayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { shippingAddress } = req.body;

  // Find the pending order or get cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    return next(new AppError("No items found for payment", 400));
  }

  // Create new Razorpay order
  const razorpayOrder = await razorpayService.createOrder(
    cart,
    req.user,
    shippingAddress
  );

  res.status(200).json({
    success: true,
    data: {
      orderId: razorpayOrder.orderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});
