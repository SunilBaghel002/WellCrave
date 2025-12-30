// controllers/productController.js
const Product = require("../models/Product");
const Category = require("../models/Category");
const { deleteImage } = require("../config/cloudinary");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get all products
exports.getAllProducts = catchAsync(async (req, res) => {
  // Build query
  const features = new APIFeatures(Product.find({ isActive: true }), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query
    .populate("category", "name slug")
    .select("-costPerUnit");

  // Get total count for pagination
  const countFeatures = new APIFeatures(
    Product.find({ isActive: true }),
    req.query
  )
    .filter()
    .search();
  const total = await Product.countDocuments(countFeatures.query.getFilter());

  res.json({
    success: true,
    data: products,
    pagination: {
      page: features.pagination.page,
      limit: features.pagination.limit,
      total,
      totalPages: Math.ceil(total / features.pagination.limit),
    },
  });
});

// Get product by ID
exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("subcategory", "name slug")
    .select("-costPerUnit");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Increment view count
  product.viewCount += 1;
  await product.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: product,
  });
});

// Get product by slug
exports.getProductBySlug = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  })
    .populate("category", "name slug")
    .populate("subcategory", "name slug")
    .select("-costPerUnit");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Increment view count
  product.viewCount += 1;
  await product.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: product,
  });
});

// Get featured products
exports.getFeaturedProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const products = await Product.getFeatured(limit);

  res.json({
    success: true,
    data: products,
  });
});

// Get best sellers
exports.getBestSellers = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const products = await Product.getBestSellers(limit);

  res.json({
    success: true,
    data: products,
  });
});

// Get new arrivals
exports.getNewArrivals = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const products = await Product.getNewArrivals(limit);

  res.json({
    success: true,
    data: products,
  });
});

// Search products
exports.searchProducts = catchAsync(async (req, res) => {
  const { search, limit = 10 } = req.query;

  if (!search || search.length < 2) {
    return res.json({
      success: true,
      data: [],
    });
  }

  const products = await Product.find({
    isActive: true,
    $text: { $search: search },
  })
    .select("name slug images basePrice rating")
    .limit(parseInt(limit, 10))
    .sort({ score: { $meta: "textScore" } });

  res.json({
    success: true,
    data: products,
  });
});

// Get filters
exports.getFilters = catchAsync(async (req, res) => {
  const [priceRange, dietaryOptions, processingMethods] = await Promise.all([
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$basePrice" },
          maxPrice: { $max: "$basePrice" },
        },
      },
    ]),
    Product.distinct("dietaryInfo", { isActive: true }),
    Product.distinct("processingMethod", { isActive: true }),
  ]);

  const categories = await Category.find({ isActive: true })
    .select("name slug productCount")
    .sort({ displayOrder: 1 });

  res.json({
    success: true,
    data: {
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 },
      dietaryOptions,
      processingMethods,
      categories,
    },
  });
});

// Get related products
exports.getRelatedProducts = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ category: product.category }, { tags: { $in: product.tags } }],
  })
    .limit(8)
    .select("name slug images basePrice rating")
    .populate("category", "name slug");

  res.json({
    success: true,
    data: relatedProducts,
  });
});

// Create product (Admin)
exports.createProduct = catchAsync(async (req, res, next) => {
  const productData = { ...req.body };

  // Handle images
  if (req.files && req.files.length > 0) {
    productData.images = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0,
    }));
  }

  // Parse variants if string
  if (typeof productData.variants === "string") {
    productData.variants = JSON.parse(productData.variants);
  }

  // Parse nutrition if string
  if (typeof productData.nutrition === "string") {
    productData.nutrition = JSON.parse(productData.nutrition);
  }

  // Parse arrays
  ["ingredients", "allergens", "dietaryInfo", "tags", "certifications"].forEach(
    (field) => {
      if (typeof productData[field] === "string") {
        productData[field] = JSON.parse(productData[field]);
      }
    }
  );

  const product = await Product.create(productData);

  // Update category product count
  await Category.updateProductCount(product.category);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// Update product (Admin)
exports.updateProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const updateData = { ...req.body };

  // Handle new images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: false,
    }));
    updateData.images = [...(product.images || []), ...newImages];
  }

  // Parse JSON strings
  [
    "variants",
    "nutrition",
    "ingredients",
    "allergens",
    "dietaryInfo",
    "tags",
    "certifications",
  ].forEach((field) => {
    if (typeof updateData[field] === "string") {
      updateData[field] = JSON.parse(updateData[field]);
    }
  });

  const oldCategory = product.category;

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  // Update category counts if category changed
  if (oldCategory.toString() !== product.category.toString()) {
    await Category.updateProductCount(oldCategory);
    await Category.updateProductCount(product.category);
  }

  res.json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

// Delete product (Admin)
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Delete images from cloudinary
  for (const image of product.images) {
    if (image.publicId) {
      await deleteImage(image.publicId);
    }
  }

  const categoryId = product.category;
  await Product.findByIdAndDelete(req.params.id);

  // Update category product count
  await Category.updateProductCount(categoryId);

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});

// Add product images
exports.addProductImages = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError("Please upload at least one image", 400));
  }

  const newImages = req.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
    isPrimary: false,
  }));

  product.images.push(...newImages);
  await product.save();

  res.json({
    success: true,
    message: "Images added successfully",
    data: product.images,
  });
});

// Delete product image
exports.deleteProductImage = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const image = product.images.id(req.params.imageId);

  if (!image) {
    return next(new AppError("Image not found", 404));
  }

  // Delete from cloudinary
  if (image.publicId) {
    await deleteImage(image.publicId);
  }

  image.deleteOne();
  await product.save();

  res.json({
    success: true,
    message: "Image deleted successfully",
    data: product.images,
  });
});

// Set primary image
exports.setPrimaryImage = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  product.images.forEach((img) => {
    img.isPrimary = img._id.equals(req.params.imageId);
  });

  await product.save();

  res.json({
    success: true,
    message: "Primary image updated",
    data: product.images,
  });
});

// Update stock
exports.updateStock = catchAsync(async (req, res, next) => {
  const { stock } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  product.totalStock = stock;
  await product.save();

  res.json({
    success: true,
    message: "Stock updated successfully",
    data: { totalStock: product.totalStock },
  });
});

// Update variant stock
exports.updateVariantStock = catchAsync(async (req, res, next) => {
  const { stock } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const variant = product.variants.id(req.params.variantId);

  if (!variant) {
    return next(new AppError("Variant not found", 404));
  }

  variant.stock = stock;
  await product.save();

  res.json({
    success: true,
    message: "Variant stock updated",
    data: variant,
  });
});

// Toggle product status
exports.toggleProductStatus = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  product.isActive = !product.isActive;
  await product.save();

  res.json({
    success: true,
    message: `Product ${product.isActive ? "activated" : "deactivated"}`,
    data: { isActive: product.isActive },
  });
});

// Toggle featured status
exports.toggleFeatured = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.json({
    success: true,
    message: `Product ${product.isFeatured ? "featured" : "unfeatured"}`,
    data: { isFeatured: product.isFeatured },
  });
});
