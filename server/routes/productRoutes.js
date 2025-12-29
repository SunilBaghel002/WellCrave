// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, optionalAuth } = require("../middleware/auth");
const { isAdmin, isAdminOrModerator } = require("../middleware/admin");
const { uploadProductImages } = require("../middleware/upload");
const validate = require("../middleware/validate");
const { productValidation, mongoIdValidation } = require("../utils/validators");

// Public routes
router.get("/", optionalAuth, productController.getAllProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/best-sellers", productController.getBestSellers);
router.get("/new-arrivals", productController.getNewArrivals);
router.get("/search", productController.searchProducts);
router.get("/filters", productController.getFilters);
router.get("/slug/:slug", optionalAuth, productController.getProductBySlug);
router.get(
  "/:id",
  optionalAuth,
  validate(mongoIdValidation),
  productController.getProductById
);
router.get(
  "/:id/related",
  validate(mongoIdValidation),
  productController.getRelatedProducts
);

// Admin routes
router.use(protect, isAdminOrModerator);

router.post(
  "/",
  uploadProductImages,
  validate(productValidation),
  productController.createProduct
);
router.put(
  "/:id",
  uploadProductImages,
  validate(productValidation),
  productController.updateProduct
);
router.delete(
  "/:id",
  isAdmin,
  validate(mongoIdValidation),
  productController.deleteProduct
);

// Product images management
router.post(
  "/:id/images",
  uploadProductImages,
  productController.addProductImages
);
router.delete("/:id/images/:imageId", productController.deleteProductImage);
router.patch("/:id/images/:imageId/primary", productController.setPrimaryImage);

// Inventory management
router.patch("/:id/stock", productController.updateStock);
router.patch(
  "/:id/variants/:variantId/stock",
  productController.updateVariantStock
);

// Product status
router.patch("/:id/status", productController.toggleProductStatus);
router.patch("/:id/featured", productController.toggleFeatured);

module.exports = router;
