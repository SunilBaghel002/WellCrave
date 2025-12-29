// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

// All cart routes require authentication
router.use(protect);

router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/update", cartController.updateCartItem);
router.delete("/remove/:productId/:variantId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);

// Coupon routes
router.post("/coupon/apply", cartController.applyCoupon);
router.delete("/coupon/remove", cartController.removeCoupon);

// Cart validation
router.post("/validate", cartController.validateCart);

// Merge guest cart (for when user logs in)
router.post("/merge", cartController.mergeCart);

// Save for later
router.post(
  "/save-for-later/:productId/:variantId",
  cartController.saveForLater
);
router.post("/move-to-cart/:productId/:variantId", cartController.moveToCart);
router.get("/saved-items", cartController.getSavedItems);

module.exports = router;
