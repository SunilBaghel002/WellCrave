// controllers/wishlistController.js
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get user's wishlist
exports.getWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.getOrCreateWishlist(req.user._id);

  // Filter out inactive products
  const activeProducts = wishlist.products.filter(
    (item) => item.product && item.product.isActive
  );

  res.json({
    success: true,
    data: {
      ...wishlist.toObject(),
      products: activeProducts,
      count: activeProducts.length,
    },
  });
});

// Add to wishlist
exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { productId, variantId, notifyOnSale, notifyOnStock } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [],
    });
  }

  // Check if already in wishlist
  const existingItem = wishlist.products.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    return next(new AppError("Product already in wishlist", 400));
  }

  wishlist.products.push({
    product: productId,
    variant: variantId,
    notifyOnSale: notifyOnSale || false,
    notifyOnStock: notifyOnStock || false,
  });

  await wishlist.save();

  await wishlist.populate(
    "products.product",
    "name slug images basePrice compareAtPrice isActive rating"
  );

  res.status(201).json({
    success: true,
    message: "Product added to wishlist",
    data: wishlist,
  });
});

// Remove from wishlist
exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  const itemIndex = wishlist.products.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new AppError("Product not in wishlist", 404));
  }

  wishlist.products.splice(itemIndex, 1);
  await wishlist.save();

  res.json({
    success: true,
    message: "Product removed from wishlist",
    data: wishlist,
  });
});

// Clear wishlist
exports.clearWishlist = catchAsync(async (req, res) => {
  await Wishlist.findOneAndUpdate({ user: req.user._id }, { products: [] });

  res.json({
    success: true,
    message: "Wishlist cleared",
  });
});

// Move item to cart
exports.moveToCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { variantId, quantity = 1 } = req.body;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  const wishlistItem = wishlist.products.find(
    (item) => item.product.toString() === productId
  );

  if (!wishlistItem) {
    return next(new AppError("Product not in wishlist", 404));
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new AppError("Product not available", 404));
  }

  const selectedVariantId = variantId || wishlistItem.variant;
  const variant = product.variants.id(selectedVariantId);

  if (!variant || !variant.isAvailable || variant.stock < quantity) {
    return next(new AppError("Selected variant is not available", 400));
  }

  // Add to cart
  let cart = await Cart.getOrCreateCart(req.user._id);

  const existingCartItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.variant.toString() === selectedVariantId.toString()
  );

  if (existingCartItem) {
    existingCartItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      variant: selectedVariantId,
      quantity,
      price: variant.price,
      name: product.name,
      image: product.images[0]?.url,
      size: variant.size,
      weight: variant.weight,
      weightUnit: variant.weightUnit,
    });
  }

  await cart.save();

  // Remove from wishlist
  wishlist.products = wishlist.products.filter(
    (item) => item.product.toString() !== productId
  );
  await wishlist.save();

  res.json({
    success: true,
    message: "Product moved to cart",
    data: { cart, wishlist },
  });
});

// Move all to cart
exports.moveAllToCart = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products.product"
  );

  if (!wishlist || wishlist.products.length === 0) {
    return next(new AppError("Wishlist is empty", 400));
  }

  let cart = await Cart.getOrCreateCart(req.user._id);
  const movedItems = [];
  const failedItems = [];

  for (const item of wishlist.products) {
    const product = item.product;

    if (!product || !product.isActive) {
      failedItems.push({
        name: product?.name || "Unknown",
        reason: "Product not available",
      });
      continue;
    }

    const variant = product.variants[0]; // Default to first variant
    if (!variant || !variant.isAvailable || variant.stock < 1) {
      failedItems.push({ name: product.name, reason: "Out of stock" });
      continue;
    }

    const existingCartItem = cart.items.find(
      (cartItem) =>
        cartItem.product.toString() === product._id.toString() &&
        cartItem.variant.toString() === variant._id.toString()
    );

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      cart.items.push({
        product: product._id,
        variant: variant._id,
        quantity: 1,
        price: variant.price,
        name: product.name,
        image: product.images[0]?.url,
        size: variant.size,
        weight: variant.weight,
        weightUnit: variant.weightUnit,
      });
    }

    movedItems.push(product.name);
  }

  await cart.save();

  // Clear wishlist (only items that were successfully moved)
  wishlist.products = wishlist.products.filter(
    (item) => !movedItems.includes(item.product.name)
  );
  await wishlist.save();

  res.json({
    success: true,
    message: `${movedItems.length} items moved to cart`,
    data: {
      cart,
      movedItems,
      failedItems,
    },
  });
});

// Check if product is in wishlist
exports.checkWishlistItem = catchAsync(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  const isInWishlist = wishlist?.products.some(
    (item) => item.product.toString() === productId
  );

  res.json({
    success: true,
    data: { isInWishlist },
  });
});

// Toggle sale notification
exports.toggleSaleNotification = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  const item = wishlist.products.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    return next(new AppError("Product not in wishlist", 404));
  }

  item.notifyOnSale = !item.notifyOnSale;
  await wishlist.save();

  res.json({
    success: true,
    message: `Sale notifications ${item.notifyOnSale ? "enabled" : "disabled"}`,
    data: { notifyOnSale: item.notifyOnSale },
  });
});

// Toggle stock notification
exports.toggleStockNotification = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  const item = wishlist.products.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    return next(new AppError("Product not in wishlist", 404));
  }

  item.notifyOnStock = !item.notifyOnStock;
  await wishlist.save();

  res.json({
    success: true,
    message: `Stock notifications ${
      item.notifyOnStock ? "enabled" : "disabled"
    }`,
    data: { notifyOnStock: item.notifyOnStock },
  });
});
