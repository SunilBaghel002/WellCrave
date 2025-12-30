// controllers/couponController.js
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Validate coupon (public)
exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return next(new AppError("Invalid coupon code", 400));
  }

  if (!coupon.isValid) {
    return next(new AppError("Coupon has expired or reached usage limit", 400));
  }

  const canUse = await coupon.canBeUsedBy(req.user._id);
  if (!canUse.valid) {
    return next(new AppError(canUse.message, 400));
  }

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumPurchase: coupon.minimumPurchase,
      maximumDiscount: coupon.maximumDiscount,
      freeShipping: coupon.freeShipping,
    },
  });
});

// Get all coupons (Admin)
exports.getAllCoupons = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const coupons = await Coupon.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Coupon.countDocuments();

  res.json({
    success: true,
    data: coupons,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get coupon stats (Admin)
exports.getCouponStats = catchAsync(async (req, res) => {
  const stats = await Coupon.aggregate([
    {
      $group: {
        _id: null,
        totalCoupons: { $sum: 1 },
        activeCoupons: {
          $sum: { $cond: ["$isActive", 1, 0] },
        },
        totalUsage: { $sum: "$usageCount" },
      },
    },
  ]);

  res.json({
    success: true,
    data: stats[0] || { totalCoupons: 0, activeCoupons: 0, totalUsage: 0 },
  });
});

// Get coupon by ID (Admin)
exports.getCouponById = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError("Coupon not found", 404));
  }

  res.json({
    success: true,
    data: coupon,
  });
});

// Get coupon by code (Admin)
exports.getCouponByCode = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

  if (!coupon) {
    return next(new AppError("Coupon not found", 404));
  }

  res.json({
    success: true,
    data: coupon,
  });
});

// Create coupon (Admin)
exports.createCoupon = catchAsync(async (req, res, next) => {
  const couponData = {
    ...req.body,
    code: req.body.code.toUpperCase(),
  };

  // Check if code already exists
  const existing = await Coupon.findOne({ code: couponData.code });
  if (existing) {
    return next(new AppError("Coupon code already exists", 400));
  }

  const coupon = await Coupon.create(couponData);

  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    data: coupon,
  });
});

// Update coupon (Admin)
exports.updateCoupon = catchAsync(async (req, res, next) => {
  const updateData = { ...req.body };
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
  }

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    return next(new AppError("Coupon not found", 404));
  }

  res.json({
    success: true,
    message: "Coupon updated successfully",
    data: coupon,
  });
});

// Delete coupon (Admin)
exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(new AppError("Coupon not found", 404));
  }

  res.json({
    success: true,
    message: "Coupon deleted successfully",
  });
});

// Toggle coupon status (Admin)
exports.toggleCouponStatus = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError("Coupon not found", 404));
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  res.json({
    success: true,
    message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}`,
    data: { isActive: coupon.isActive },
  });
});

// Bulk create coupons (Admin)
exports.bulkCreateCoupons = catchAsync(async (req, res, next) => {
  const { prefix, count, ...couponData } = req.body;

  if (!prefix || !count || count < 1 || count > 100) {
    return next(new AppError("Invalid prefix or count (max 100)", 400));
  }

  const coupons = [];
  for (let i = 0; i < count; i++) {
    const code = `${prefix}${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
    coupons.push({
      ...couponData,
      code,
      usageLimitPerUser: 1,
      usageLimit: 1,
    });
  }

  const created = await Coupon.insertMany(coupons);

  res.status(201).json({
    success: true,
    message: `${created.length} coupons created`,
    data: created,
  });
});

// Bulk delete coupons (Admin)
exports.bulkDeleteCoupons = catchAsync(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new AppError("Please provide coupon IDs", 400));
  }

  const result = await Coupon.deleteMany({ _id: { $in: ids } });

  res.json({
    success: true,
    message: `${result.deletedCount} coupons deleted`,
  });
});
