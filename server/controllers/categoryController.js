// controllers/categoryController.js
const Category = require("../models/Category");
const Product = require("../models/Product");
const { deleteImage } = require("../config/cloudinary");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get all categories
exports.getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({
    displayOrder: 1,
  });

  res.json({
    success: true,
    data: categories,
  });
});

// Get category tree
exports.getCategoryTree = catchAsync(async (req, res) => {
  const tree = await Category.getCategoryTree();

  res.json({
    success: true,
    data: tree,
  });
});

// Get featured categories
exports.getFeaturedCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({ isActive: true, isFeatured: true })
    .sort({ displayOrder: 1 })
    .limit(6);

  res.json({
    success: true,
    data: categories,
  });
});

// Get category by slug
exports.getCategoryBySlug = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.json({
    success: true,
    data: category,
  });
});

// Get category by ID
exports.getCategoryById = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.json({
    success: true,
    data: category,
  });
});

// Get category products
exports.getCategoryProducts = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || "-createdAt";

  const products = await Product.find({
    category: category._id,
    isActive: true,
  })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select("-costPerUnit");

  const total = await Product.countDocuments({
    category: category._id,
    isActive: true,
  });

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get subcategories
exports.getSubcategories = catchAsync(async (req, res, next) => {
  const subcategories = await Category.find({
    parent: req.params.id,
    isActive: true,
  }).sort({ displayOrder: 1 });

  res.json({
    success: true,
    data: subcategories,
  });
});

// Create category (Admin)
exports.createCategory = catchAsync(async (req, res) => {
  const categoryData = { ...req.body };

  if (req.file) {
    categoryData.image = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const category = await Category.create(categoryData);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

// Update category (Admin)
exports.updateCategory = catchAsync(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const updateData = { ...req.body };

  if (req.file) {
    // Delete old image
    if (category.image?.publicId) {
      await deleteImage(category.image.publicId);
    }

    updateData.image = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

// Delete category (Admin)
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    return next(
      new AppError(
        "Cannot delete category with products. Please move or delete products first.",
        400
      )
    );
  }

  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({
    parent: category._id,
  });
  if (subcategoryCount > 0) {
    return next(
      new AppError(
        "Cannot delete category with subcategories. Please delete subcategories first.",
        400
      )
    );
  }

  // Delete image
  if (category.image?.publicId) {
    await deleteImage(category.image.publicId);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

// Toggle category status
exports.toggleCategoryStatus = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  category.isActive = !category.isActive;
  await category.save();

  res.json({
    success: true,
    message: `Category ${category.isActive ? "activated" : "deactivated"}`,
    data: { isActive: category.isActive },
  });
});

// Toggle featured status
exports.toggleFeatured = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  category.isFeatured = !category.isFeatured;
  await category.save();

  res.json({
    success: true,
    message: `Category ${category.isFeatured ? "featured" : "unfeatured"}`,
    data: { isFeatured: category.isFeatured },
  });
});

// Reorder categories
exports.reorderCategories = catchAsync(async (req, res) => {
  const { orderedIds } = req.body;

  const updatePromises = orderedIds.map((id, index) =>
    Category.findByIdAndUpdate(id, { displayOrder: index })
  );

  await Promise.all(updatePromises);

  res.json({
    success: true,
    message: "Categories reordered successfully",
  });
});
