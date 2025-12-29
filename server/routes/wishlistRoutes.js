// routes/wishlistRoutes.js
const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

// All wishlist routes require authentication
router.use(protect);

router.get("/", wishlistController.getWishlist);
router.post("/add", wishlistController.addToWishlist);
router.delete("/remove/:productId", wishlistController.removeFromWishlist);
router.delete("/clear", wishlistController.clearWishlist);
router.post("/move-to-cart/:productId", wishlistController.moveToCart);
router.post("/move-all-to-cart", wishlistController.moveAllToCart);

// Check if product is in wishlist
router.get("/check/:productId", wishlistController.checkWishlistItem);

// Notifications settings
router.patch(
  "/:productId/notify-sale",
  wishlistController.toggleSaleNotification
);
router.patch(
  "/:productId/notify-stock",
  wishlistController.toggleStockNotification
);

module.exports = router;
