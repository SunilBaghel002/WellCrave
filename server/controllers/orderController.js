// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const emailService = require("../services/emailService");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get my orders
exports.getMyOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  const filter = { user: req.user._id };
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "orderNumber status total items createdAt payment.status shipping.method deliveredAt"
    );

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get order by ID
exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "items.product",
    "name slug images"
  );

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check if order belongs to user (unless admin)
  if (
    req.user.role !== "admin" &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("Not authorized to view this order", 403));
  }

  res.json({
    success: true,
    data: order,
  });
});

// Get order by order number
exports.getOrderByNumber = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
  }).populate("items.product", "name slug images");

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check if order belongs to user (unless admin)
  if (
    req.user.role !== "admin" &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("Not authorized to view this order", 403));
  }

  res.json({
    success: true,
    data: order,
  });
});

// Cancel order
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to cancel this order", 403));
  }

  // Check if order can be cancelled
  if (!order.canBeCancelled()) {
    return next(new AppError("Order cannot be cancelled at this stage", 400));
  }

  // Update order status
  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancellationReason = reason;
  order.addStatusHistory(
    "cancelled",
    reason || "Cancelled by customer",
    req.user._id
  );

  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findOneAndUpdate(
      { _id: item.product, "variants._id": item.variant },
      {
        $inc: {
          "variants.$.stock": item.quantity,
          soldCount: -item.quantity,
        },
      }
    );
  }

  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: order,
  });
});

// Request return
exports.requestReturn = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  // Check if order is delivered
  if (order.status !== "delivered") {
    return next(new AppError("Only delivered orders can be returned", 400));
  }

  // Check return window (e.g., 7 days)
  const deliveredAt = new Date(order.deliveredAt);
  const returnWindow = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  if (Date.now() - deliveredAt > returnWindow) {
    return next(new AppError("Return window has expired", 400));
  }

  order.returnReason = reason;
  order.returnRequestedAt = new Date();
  order.addStatusHistory(
    "return_requested",
    reason || "Return requested",
    req.user._id
  );

  await order.save();

  res.json({
    success: true,
    message: "Return request submitted",
    data: order,
  });
});

// Get all orders (Admin)
exports.getAllOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const { status, paymentStatus, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter["payment.status"] = paymentStatus;
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "shippingAddress.email": { $regex: search, $options: "i" } },
    ];
  }

  const orders = await Order.find(filter)
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get order stats (Admin)
exports.getOrderStats = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const stats = await Order.getStatistics(start, end);

  // Order status distribution
  const statusDistribution = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      ...stats,
      statusDistribution: statusDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    },
  });
});

// Update order status (Admin)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  const validStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  order.status = status;
  order.addStatusHistory(status, note, req.user._id);

  if (status === "delivered") {
    order.deliveredAt = new Date();
  }

  if (status === "cancelled") {
    order.cancelledAt = new Date();
  }

  await order.save();

  // Send notification email
  try {
    if (status === "shipped") {
      const user = await order.populate("user");
      await emailService.sendShippingNotification(order, user.user);
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }

  res.json({
    success: true,
    message: "Order status updated",
    data: order,
  });
});

// Update tracking (Admin)
exports.updateTracking = catchAsync(async (req, res, next) => {
  const { carrier, trackingNumber, trackingUrl, estimatedDelivery } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  order.tracking = {
    ...order.tracking,
    carrier,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
  };

  await order.save();

  res.json({
    success: true,
    message: "Tracking updated",
    data: order,
  });
});

// Refund order (Admin)
exports.refundOrder = catchAsync(async (req, res, next) => {
  const { amount, reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (!order.canBeRefunded()) {
    return next(new AppError("Order cannot be refunded", 400));
  }

  const razorpayService = require("../services/razorpayService");
  const refund = await razorpayService.createRefund(order, amount, reason);

  res.json({
    success: true,
    message: "Refund initiated",
    data: refund,
  });
});

// Update internal notes (Admin)
exports.updateInternalNotes = catchAsync(async (req, res, next) => {
  const { internalNotes } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { internalNotes },
    { new: true }
  );

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.json({
    success: true,
    message: "Notes updated",
    data: order,
  });
});

// Export orders (Admin)
exports.exportOrders = catchAsync(async (req, res) => {
  const { startDate, endDate, format = "json" } = req.query;

  const filter = {};
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const orders = await Order.find(filter)
    .populate("user", "firstName lastName email")
    .lean();

  if (format === "csv") {
    // Generate CSV
    const fields = ["orderNumber", "status", "total", "createdAt"];
    const csv = orders
      .map((order) => fields.map((field) => order[field]).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
    return res.send(`${fields.join(",")}\n${csv}`);
  }

  res.json({
    success: true,
    data: orders,
  });
});
