// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect, optionalAuth } = require("../middleware/auth");
const { isAdmin, isAdminOrModerator } = require("../middleware/admin");
const { uploadReviewImages } = require("../middleware/upload");
const { reviewLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const { reviewValidation, mongoIdValidation } = require("../utils/validators");

// Public routes
router.get(
  "/product/:productId",
  optionalAuth,
  reviewController.getProductReviews
);
router.get("/product/:productId/stats", reviewController.getProductReviewStats);
router.get("/:id", validate(mongoIdValidation), reviewController.getReviewById);

// Protected routes
router.use(protect);

router.post(
  "/",
  reviewLimiter,
  uploadReviewImages,
  validate(reviewValidation),
  reviewController.createReview
);
router.put(
  "/:id",
  uploadReviewImages,
  validate([...mongoIdValidation, ...reviewValidation]),
  reviewController.updateReview
);
router.delete(
  "/:id",
  validate(mongoIdValidation),
  reviewController.deleteReview
);

// Voting
router.post(
  "/:id/vote",
  validate(mongoIdValidation),
  reviewController.voteReview
);

// Report review
router.post(
  "/:id/report",
  validate(mongoIdValidation),
  reviewController.reportReview
);

// Get user's reviews
router.get("/user/me", reviewController.getMyReviews);

// Admin routes
router.get("/admin/all", isAdminOrModerator, reviewController.getAllReviews);
router.get(
  "/admin/pending",
  isAdminOrModerator,
  reviewController.getPendingReviews
);
router.patch(
  "/admin/:id/approve",
  isAdminOrModerator,
  validate(mongoIdValidation),
  reviewController.approveReview
);
router.patch(
  "/admin/:id/reject",
  isAdminOrModerator,
  validate(mongoIdValidation),
  reviewController.rejectReview
);
router.post(
  "/admin/:id/respond",
  isAdminOrModerator,
  validate(mongoIdValidation),
  reviewController.respondToReview
);

module.exports = router;
