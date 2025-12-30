// controllers/reviewController.js
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get product reviews
exports.getProductReviews = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || "-createdAt";

  const reviews = await Review.find({
    product: req.params.productId,
    isApproved: true,
  })
    .populate("user", "firstName lastName avatar")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({
    product: req.params.productId,
    isApproved: true,
  });

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get product review stats
exports.getProductReviewStats = catchAsync(async (req, res) => {
  const productId = req.params.productId;

  const stats = await Review.aggregate([
    {
      $match: {
        product: require("mongoose").Types.ObjectId(productId),
        isApproved: true,
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const distribution = await Review.getRatingDistribution(productId);

  res.json({
    success: true,
    data: {
      avgRating: stats[0]?.avgRating || 0,
      totalReviews: stats[0]?.totalReviews || 0,
      distribution,
    },
  });
});

// Get review by ID
exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate("user", "firstName lastName avatar")
    .populate("product", "name slug");

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.json({
    success: true,
    data: review,
  });
});

// Create review
exports.createReview = catchAsync(async (req, res, next) => {
  const { productId, rating, title, comment, pros, cons } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (existingReview) {
    return next(new AppError("You have already reviewed this product", 400));
  }

  // Check if user has purchased this product
  const hasPurchased = await Order.exists({
    user: req.user._id,
    "items.product": productId,
    "payment.status": "completed",
  });

  const reviewData = {
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment,
    pros: pros || [],
    cons: cons || [],
    isVerifiedPurchase: !!hasPurchased,
    isApproved: true, // Auto-approve for now
  };

  // Handle images
  if (req.files && req.files.length > 0) {
    reviewData.images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
  }

  const review = await Review.create(reviewData);
  await review.populate("user", "firstName lastName avatar");

  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    data: review,
  });
});

// Update review
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Check ownership
  if (review.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this review", 403));
  }

  const allowedUpdates = ["rating", "title", "comment", "pros", "cons"];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      review[field] = req.body[field];
    }
  });

  // Handle new images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
    review.images.push(...newImages);
  }

  await review.save();
  await review.populate("user", "firstName lastName avatar");

  res.json({
    success: true,
    message: "Review updated successfully",
    data: review,
  });
});

// Delete review
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Check ownership or admin
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new AppError("Not authorized to delete this review", 403));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Review deleted successfully",
  });
});

// Vote on review
exports.voteReview = catchAsync(async (req, res, next) => {
  const { vote } = req.body; // 'helpful' or 'not-helpful'
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Check if user already voted
  const existingVoteIndex = review.votedBy.findIndex(
    (v) => v.user.toString() === req.user._id.toString()
  );

  if (existingVoteIndex >= 0) {
    const oldVote = review.votedBy[existingVoteIndex].vote;

    // Remove old vote count
    if (oldVote === "helpful") {
      review.helpfulVotes -= 1;
    } else {
      review.notHelpfulVotes -= 1;
    }

    // Update vote
    review.votedBy[existingVoteIndex].vote = vote;
  } else {
    review.votedBy.push({ user: req.user._id, vote });
  }

  // Add new vote count
  if (vote === "helpful") {
    review.helpfulVotes += 1;
  } else {
    review.notHelpfulVotes += 1;
  }

  await review.save();

  res.json({
    success: true,
    message: "Vote recorded",
    data: {
      helpfulVotes: review.helpfulVotes,
      notHelpfulVotes: review.notHelpfulVotes,
    },
  });
});

// Report review
exports.reportReview = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  review.isReported = true;
  review.reportReason = reason;
  await review.save();

  res.json({
    success: true,
    message: "Review reported",
  });
});

// Get my reviews
exports.getMyReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate("product", "name slug images")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: reviews,
  });
});

// Get all reviews (Admin)
exports.getAllReviews = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const reviews = await Review.find()
    .populate("user", "firstName lastName email")
    .populate("product", "name slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments();

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get pending reviews (Admin)
exports.getPendingReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ isApproved: false })
    .populate("user", "firstName lastName email")
    .populate("product", "name slug")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: reviews,
  });
});

// Approve review (Admin)
exports.approveReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.json({
    success: true,
    message: "Review approved",
    data: review,
  });
});

// Reject review (Admin)
exports.rejectReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.json({
    success: true,
    message: "Review rejected and deleted",
  });
});

// Respond to review (Admin)
exports.respondToReview = catchAsync(async (req, res, next) => {
  const { comment } = req.body;
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  review.adminResponse = {
    comment,
    respondedAt: new Date(),
    respondedBy: req.user._id,
  };

  await review.save();

  res.json({
    success: true,
    message: "Response added",
    data: review,
  });
});
