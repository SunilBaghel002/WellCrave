// controllers/adminController.js
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Review = require("../models/Review");
const analyticsService = require("../services/analyticsService");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get dashboard data
exports.getDashboard = catchAsync(async (req, res) => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);

  const [overview, recentOrders, lowStockProducts, pendingReviews] =
    await Promise.all([
      analyticsService.getDashboardOverview(thirtyDaysAgo, today),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "firstName lastName email"),
      Product.find({ isActive: true, totalStock: { $lte: 10 } })
        .select("name totalStock")
        .limit(10),
      Review.countDocuments({ isApproved: false }),
    ]);

  res.json({
    success: true,
    data: {
      overview,
      recentOrders,
      lowStockProducts,
      pendingReviews,
    },
  });
});

// Get dashboard overview
exports.getDashboardOverview = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const overview = await analyticsService.getDashboardOverview(start, end);

  res.json({
    success: true,
    data: overview,
  });
});

// Get revenue analytics
exports.getRevenueAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate, period } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const revenue = await analyticsService.getRevenueByPeriod(start, end, period);

  res.json({
    success: true,
    data: revenue,
  });
});

// Get order analytics
exports.getOrderAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const [statusDistribution, salesByTime] = await Promise.all([
    analyticsService.getOrderStatusDistribution(start, end),
    analyticsService.getSalesByTimeOfDay(start, end),
  ]);

  res.json({
    success: true,
    data: {
      statusDistribution,
      salesByTime,
    },
  });
});

// Get product analytics
exports.getProductAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate, limit } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const topProducts = await analyticsService.getTopSellingProducts(
    parseInt(limit, 10) || 10,
    start,
    end
  );

  res.json({
    success: true,
    data: topProducts,
  });
});

// Get customer analytics
exports.getCustomerAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const customerData = await analyticsService.getCustomerAnalytics(start, end);

  res.json({
    success: true,
    data: customerData,
  });
});

// Get category analytics
exports.getCategoryAnalytics = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  const categoryPerformance = await analyticsService.getCategoryPerformance(
    start,
    end
  );

  res.json({
    success: true,
    data: categoryPerformance,
  });
});

// Export analytics
exports.exportAnalytics = catchAsync(async (req, res) => {
  const { type, startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const data = await analyticsService.exportAnalyticsData(type, start, end);

  res.json({
    success: true,
    data,
  });
});

// Get all users (Admin)
exports.getAllUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const { search, role, isActive } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get user by ID (Admin)
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Get user's order stats
  const orderStats = await Order.aggregate([
    { $match: { user: user._id, "payment.status": "completed" } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total" },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      orderStats: orderStats[0] || { totalOrders: 0, totalSpent: 0 },
    },
  });
});

// Update user (Admin)
exports.updateUser = catchAsync(async (req, res, next) => {
  const allowedFields = ["firstName", "lastName", "phone", "isActive"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// Update user role (Admin)
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;

  if (!["user", "admin", "moderator"].includes(role)) {
    return next(new AppError("Invalid role", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.json({
    success: true,
    message: "User role updated",
    data: user,
  });
});

// Toggle user status (Admin)
exports.toggleUserStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"}`,
    data: { isActive: user.isActive },
  });
});

// Delete user (Admin)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

// Get inventory
exports.getInventory = catchAsync(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .select("name totalStock lowStockThreshold variants")
    .sort({ totalStock: 1 });

  res.json({
    success: true,
    data: products,
  });
});

// Get inventory alerts
exports.getInventoryAlerts = catchAsync(async (req, res) => {
  const alerts = await analyticsService.getInventoryAlerts();

  res.json({
    success: true,
    data: alerts,
  });
});

// Get low stock products
exports.getLowStockProducts = catchAsync(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ["$totalStock", "$lowStockThreshold"] },
  })
    .select("name slug totalStock lowStockThreshold images")
    .sort({ totalStock: 1 });

  res.json({
    success: true,
    data: products,
  });
});

// Bulk update inventory
exports.bulkUpdateInventory = catchAsync(async (req, res) => {
  const { updates } = req.body; // Array of { productId, variantId, stock }

  const results = [];
  for (const update of updates) {
    if (update.variantId) {
      await Product.findOneAndUpdate(
        { _id: update.productId, "variants._id": update.variantId },
        { "variants.$.stock": update.stock }
      );
    } else {
      await Product.findByIdAndUpdate(update.productId, {
        totalStock: update.stock,
      });
    }
    results.push(update);
  }

  res.json({
    success: true,
    message: `${results.length} products updated`,
    data: results,
  });
});

// Get sales report
exports.getSalesReport = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const [revenue, topProducts, customerStats] = await Promise.all([
    analyticsService.getRevenueByPeriod(start, end, "daily"),
    analyticsService.getTopSellingProducts(10, start, end),
    analyticsService.getCustomerAnalytics(start, end),
  ]);

  res.json({
    success: true,
    data: {
      revenue,
      topProducts,
      customerStats,
    },
  });
});

// Get product report
exports.getProductReport = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  const [topProducts, categoryPerformance, inventoryAlerts] = await Promise.all(
    [
      analyticsService.getTopSellingProducts(20, start, end),
      analyticsService.getCategoryPerformance(start, end),
      analyticsService.getInventoryAlerts(),
    ]
  );

  res.json({
    success: true,
    data: {
      topProducts,
      categoryPerformance,
      inventoryAlerts,
    },
  });
});

// Get customer report
exports.getCustomerReport = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  const customerData = await analyticsService.getCustomerAnalytics(start, end);

  res.json({
    success: true,
    data: customerData,
  });
});

// Get settings
exports.getSettings = catchAsync(async (req, res) => {
  // Implement settings storage
  res.json({
    success: true,
    data: {
      storeName: "DehydratedFoods",
      currency: "INR",
      taxRate: 0.18,
      freeShippingThreshold: 500,
      shippingCost: 49,
    },
  });
});

// Update settings
exports.updateSettings = catchAsync(async (req, res) => {
  // Implement settings update
  res.json({
    success: true,
    message: "Settings updated",
  });
});

// Get activity logs
exports.getActivityLogs = catchAsync(async (req, res) => {
  // Implement activity logging
  res.json({
    success: true,
    data: [],
  });
});

// Bulk update products
exports.bulkUpdateProducts = catchAsync(async (req, res) => {
  const { productIds, updates } = req.body;

  await Product.updateMany({ _id: { $in: productIds } }, updates);

  res.json({
    success: true,
    message: `${productIds.length} products updated`,
  });
});

// Bulk update orders
exports.bulkUpdateOrders = catchAsync(async (req, res) => {
  const { orderIds, status, note } = req.body;

  for (const orderId of orderIds) {
    const order = await Order.findById(orderId);
    if (order) {
      order.status = status;
      order.addStatusHistory(status, note || "Bulk update", req.user._id);
      await order.save();
    }
  }

  res.json({
    success: true,
    message: `${orderIds.length} orders updated`,
  });
});
