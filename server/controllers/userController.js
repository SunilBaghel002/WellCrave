// controllers/userController.js
const User = require("../models/User");
const Order = require("../models/Order");
const { deleteImage } = require("../config/cloudinary");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get user profile
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.json({
    success: true,
    data: user,
  });
});

// Update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ["firstName", "lastName", "phone"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

// Update avatar
exports.updateAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image", 400));
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar if exists
  if (user.avatarPublicId) {
    await deleteImage(user.avatarPublicId);
  }

  // Update with new avatar
  user.avatar = req.file.path;
  user.avatarPublicId = req.file.filename;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Avatar updated successfully",
    data: {
      avatar: user.avatar,
    },
  });
});

// Delete avatar
exports.deleteAvatar = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.avatarPublicId) {
    await deleteImage(user.avatarPublicId);
  }

  user.avatar =
    "https://res.cloudinary.com/demo/image/upload/v1/avatars/default-avatar.png";
  user.avatarPublicId = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Avatar deleted successfully",
  });
});

// Get user addresses
exports.getAddresses = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("addresses");

  res.json({
    success: true,
    data: user.addresses,
  });
});

// Add new address
exports.addAddress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  const newAddress = {
    ...req.body,
    isDefault: user.addresses.length === 0 ? true : req.body.isDefault,
  };

  // If new address is default, remove default from others
  if (newAddress.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push(newAddress);
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: user.addresses,
  });
});

// Update address
exports.updateAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  // Update address fields
  Object.keys(req.body).forEach((key) => {
    if (key !== "_id") {
      address[key] = req.body[key];
    }
  });

  // Handle default address
  if (req.body.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.equals(address._id);
    });
  }

  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Address updated successfully",
    data: user.addresses,
  });
});

// Delete address
exports.deleteAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  const wasDefault = address.isDefault;
  address.deleteOne();

  // If deleted address was default, make first remaining address default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Address deleted successfully",
    data: user.addresses,
  });
});

// Set default address
exports.setDefaultAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  user.addresses.forEach((addr) => {
    addr.isDefault = addr._id.equals(address._id);
  });

  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Default address updated",
    data: user.addresses,
  });
});

// Get user preferences
exports.getPreferences = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("preferences");

  res.json({
    success: true,
    data: user.preferences,
  });
});

// Update user preferences
exports.updatePreferences = catchAsync(async (req, res) => {
  const allowedPreferences = [
    "newsletter",
    "notifications",
    "language",
    "currency",
  ];
  const updates = {};

  allowedPreferences.forEach((pref) => {
    if (req.body[pref] !== undefined) {
      updates[`preferences.${pref}`] = req.body[pref];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
  }).select("preferences");

  res.json({
    success: true,
    message: "Preferences updated successfully",
    data: user.preferences,
  });
});

// Get user orders (quick access)
exports.getUserOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("orderNumber status total items createdAt payment.status");

  const total = await Order.countDocuments({ user: req.user._id });

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

// Deactivate account
exports.deactivateAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (user.authProvider === "local") {
    if (!password) {
      return next(new AppError("Please provide your password", 400));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError("Incorrect password", 401));
    }
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Account deactivated successfully",
  });
});

// Delete account
exports.deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (user.authProvider === "local") {
    if (!password) {
      return next(new AppError("Please provide your password", 400));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError("Incorrect password", 401));
    }
  }

  // Delete avatar if exists
  if (user.avatarPublicId) {
    await deleteImage(user.avatarPublicId);
  }

  await User.findByIdAndDelete(req.user._id);

  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});

// Get notifications (placeholder)
exports.getNotifications = catchAsync(async (req, res) => {
  // Implement notification system
  res.json({
    success: true,
    data: [],
  });
});

// Mark notification as read
exports.markNotificationRead = catchAsync(async (req, res) => {
  res.json({
    success: true,
    message: "Notification marked as read",
  });
});

// Mark all notifications as read
exports.markAllNotificationsRead = catchAsync(async (req, res) => {
  res.json({
    success: true,
    message: "All notifications marked as read",
  });
});
