// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const { isAdmin, isAdminOrModerator } = require("../middleware/admin");
const { uploadCategoryImage } = require("../middleware/upload");
const validate = require("../middleware/validate");
const { mongoIdValidation } = require("../utils/validators");

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/tree", categoryController.getCategoryTree);
router.get("/featured", categoryController.getFeaturedCategories);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get(
  "/:id",
  validate(mongoIdValidation),
  categoryController.getCategoryById
);
router.get(
  "/:id/products",
  validate(mongoIdValidation),
  categoryController.getCategoryProducts
);
router.get(
  "/:id/subcategories",
  validate(mongoIdValidation),
  categoryController.getSubcategories
);

// Admin routes
router.use(protect, isAdminOrModerator);

router.post("/", uploadCategoryImage, categoryController.createCategory);
router.put(
  "/:id",
  uploadCategoryImage,
  validate(mongoIdValidation),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  isAdmin,
  validate(mongoIdValidation),
  categoryController.deleteCategory
);
router.patch("/:id/status", categoryController.toggleCategoryStatus);
router.patch("/:id/featured", categoryController.toggleFeatured);
router.put("/reorder", categoryController.reorderCategories);

module.exports = router;
