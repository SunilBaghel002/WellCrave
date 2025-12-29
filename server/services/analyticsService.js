// services/analyticsService.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Review = require("../models/Review");
const mongoose = require("mongoose");

class AnalyticsService {
  // Get dashboard overview
  async getDashboardOverview(startDate, endDate) {
    const dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    // Get order stats
    const orderStats = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
          totalItems: { $sum: { $size: "$items" } },
        },
      },
    ]);

    // Get new users count
    const newUsers = await User.countDocuments(dateFilter);

    // Get previous period for comparison
    const periodLength = new Date(endDate) - new Date(startDate);
    const prevStartDate = new Date(new Date(startDate) - periodLength);
    const prevEndDate = new Date(startDate);

    const prevOrderStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: prevStartDate,
            $lte: prevEndDate,
          },
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
        },
      },
    ]);

    const current = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      totalItems: 0,
    };
    const previous = prevOrderStats[0] || { totalOrders: 0, totalRevenue: 0 };

    // Calculate growth percentages
    const orderGrowth =
      previous.totalOrders > 0
        ? ((current.totalOrders - previous.totalOrders) /
            previous.totalOrders) *
          100
        : 100;

    const revenueGrowth =
      previous.totalRevenue > 0
        ? ((current.totalRevenue - previous.totalRevenue) /
            previous.totalRevenue) *
          100
        : 100;

    return {
      totalOrders: current.totalOrders,
      totalRevenue: Math.round(current.totalRevenue * 100) / 100,
      avgOrderValue: Math.round(current.avgOrderValue * 100) / 100 || 0,
      totalItemsSold: current.totalItems,
      newUsers,
      orderGrowth: Math.round(orderGrowth * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    };
  }

  // Get revenue by period (daily, weekly, monthly)
  async getRevenueByPeriod(startDate, endDate, period = "daily") {
    let dateFormat;
    switch (period) {
      case "weekly":
        dateFormat = { $isoWeek: "$createdAt" };
        break;
      case "monthly":
        dateFormat = { $month: "$createdAt" };
        break;
      default:
        dateFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
    }

    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: dateFormat,
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
          avgOrder: { $avg: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return revenue.map((item) => ({
      date: item._id,
      revenue: Math.round(item.revenue * 100) / 100,
      orders: item.orders,
      avgOrder: Math.round(item.avgOrder * 100) / 100,
    }));
  }

  // Get top selling products
  async getTopSellingProducts(limit = 10, startDate, endDate) {
    const matchStage = {
      "payment.status": "completed",
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const topProducts = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          name: "$product.name",
          slug: "$product.slug",
          image: { $arrayElemAt: ["$product.images.url", 0] },
          totalSold: 1,
          totalRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    return topProducts;
  }

  // Get category performance
  async getCategoryPerformance(startDate, endDate) {
    const matchStage = {
      "payment.status": "completed",
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const categoryStats = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          name: { $first: "$category.name" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    return categoryStats;
  }

  // Get customer analytics
  async getCustomerAnalytics(startDate, endDate) {
    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          }
        : {};

    // New vs returning customers
    const customerStats = await Order.aggregate([
      { $match: { "payment.status": "completed", ...dateFilter } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          firstOrder: { $min: "$createdAt" },
          lastOrder: { $max: "$createdAt" },
        },
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          newCustomers: {
            $sum: { $cond: [{ $eq: ["$orderCount", 1] }, 1, 0] },
          },
          returningCustomers: {
            $sum: { $cond: [{ $gt: ["$orderCount", 1] }, 1, 0] },
          },
          avgOrdersPerCustomer: { $avg: "$orderCount" },
          avgCustomerValue: { $avg: "$totalSpent" },
        },
      },
    ]);

    // Top customers
    const topCustomers = await Order.aggregate([
      { $match: { "payment.status": "completed" } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          email: "$user.email",
          orderCount: 1,
          totalSpent: 1,
        },
      },
    ]);

    return {
      summary: customerStats[0] || {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        avgOrdersPerCustomer: 0,
        avgCustomerValue: 0,
      },
      topCustomers,
    };
  }

  // Get order status distribution
  async getOrderStatusDistribution(startDate, endDate) {
    const matchStage = {};

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const statusDistribution = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return statusDistribution.map((item) => ({
      status: item._id,
      count: item.count,
      totalValue: Math.round(item.totalValue * 100) / 100,
    }));
  }

  // Get inventory alerts
  async getInventoryAlerts() {
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ["$totalStock", "$lowStockThreshold"] },
    })
      .select("name slug totalStock lowStockThreshold images variants")
      .sort({ totalStock: 1 })
      .limit(20);

    const outOfStockProducts = await Product.find({
      isActive: true,
      totalStock: 0,
    })
      .select("name slug images")
      .limit(20);

    return {
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
    };
  }

  // Get review analytics
  async getReviewAnalytics(startDate, endDate) {
    const matchStage = {};

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const reviewStats = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          approvedReviews: {
            $sum: { $cond: ["$isApproved", 1, 0] },
          },
          pendingReviews: {
            $sum: { $cond: ["$isApproved", 0, 1] },
          },
          verifiedPurchases: {
            $sum: { $cond: ["$isVerifiedPurchase", 1, 0] },
          },
        },
      },
    ]);

    const ratingDistribution = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return {
      summary: reviewStats[0] || {
        totalReviews: 0,
        avgRating: 0,
        approvedReviews: 0,
        pendingReviews: 0,
        verifiedPurchases: 0,
      },
      ratingDistribution: ratingDistribution.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      ),
    };
  }

  // Get sales by time of day
  async getSalesByTimeOfDay(startDate, endDate) {
    const matchStage = {
      "payment.status": "completed",
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const salesByHour = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return salesByHour.map((item) => ({
      hour: item._id,
      orders: item.orders,
      revenue: Math.round(item.revenue * 100) / 100,
    }));
  }

  // Get geographic distribution
  async getGeographicDistribution(startDate, endDate) {
    const matchStage = {
      "payment.status": "completed",
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const byState = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$shippingAddress.state",
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 },
    ]);

    const byCountry = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$shippingAddress.country",
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return {
      byState,
      byCountry,
    };
  }

  // Get conversion funnel
  async getConversionFunnel(startDate, endDate) {
    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          }
        : {};

    // Total users who visited (approximation using active sessions)
    const totalUsers = await User.countDocuments({
      lastLogin: dateFilter.createdAt || { $exists: true },
    });

    // Users who added to cart
    const cartsCreated = await mongoose
      .model("Cart")
      .countDocuments(dateFilter);

    // Users who started checkout (orders created)
    const ordersCreated = await Order.countDocuments(dateFilter);

    // Completed purchases
    const completedOrders = await Order.countDocuments({
      ...dateFilter,
      "payment.status": "completed",
    });

    return {
      visitors: totalUsers,
      addedToCart: cartsCreated,
      startedCheckout: ordersCreated,
      completedPurchase: completedOrders,
      cartConversion:
        totalUsers > 0
          ? Math.round((cartsCreated / totalUsers) * 100 * 10) / 10
          : 0,
      checkoutConversion:
        cartsCreated > 0
          ? Math.round((ordersCreated / cartsCreated) * 100 * 10) / 10
          : 0,
      purchaseConversion:
        ordersCreated > 0
          ? Math.round((completedOrders / ordersCreated) * 100 * 10) / 10
          : 0,
      overallConversion:
        totalUsers > 0
          ? Math.round((completedOrders / totalUsers) * 100 * 10) / 10
          : 0,
    };
  }

  // Export analytics data
  async exportAnalyticsData(type, startDate, endDate) {
    let data;

    switch (type) {
      case "orders":
        data = await Order.find({
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        })
          .populate("user", "firstName lastName email")
          .select("-__v")
          .lean();
        break;

      case "products":
        data = await this.getTopSellingProducts(100, startDate, endDate);
        break;

      case "customers":
        const customerData = await this.getCustomerAnalytics(
          startDate,
          endDate
        );
        data = customerData.topCustomers;
        break;

      case "revenue":
        data = await this.getRevenueByPeriod(startDate, endDate, "daily");
        break;

      default:
        throw new Error("Invalid export type");
    }

    return data;
  }
}

module.exports = new AnalyticsService();
