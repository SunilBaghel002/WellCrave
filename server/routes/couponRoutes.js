// routes/couponRoutes.js
const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { protect } = require("../middleware/auth");
const { isAdmin, isAdminOrModerator } = require("../middleware/admin");
const validate = require("../middleware/validate");
const { couponValidation, mongoIdValidation } = require("../utils/validators");

// Public route to validate coupon
router.post("/validate", protect, couponController.validateCoupon);

// Admin routes
router.use(protect, isAdminOrModerator);

router.get("/", couponController.getAllCoupons);
router.get("/stats", couponController.getCouponStats);
router.get("/:id", validate(mongoIdValidation), couponController.getCouponById);
router.get("/code/:code", couponController.getCouponByCode);
router.post(
  "/",
  isAdmin,
  validate(couponValidation),
  couponController.createCoupon
);
router.put(
  "/:id",
  isAdmin,
  validate([...mongoIdValidation, ...couponValidation]),
  couponController.updateCoupon
);
router.delete(
  "/:id",
  isAdmin,
  validate(mongoIdValidation),
  couponController.deleteCoupon
);
router.patch("/:id/status", couponController.toggleCouponStatus);

// Bulk operations
router.post("/bulk-create", isAdmin, couponController.bulkCreateCoupons);
router.delete("/bulk-delete", isAdmin, couponController.bulkDeleteCoupons);

module.exports = router;
