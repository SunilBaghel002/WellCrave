// controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get cart
exports.getCart = catchAsync(async (req, res) => {
  const cart = await Cart.getOrCreateCart(req.user._id);

  res.json({
    success: true,
    data: cart,
  });
});

// Add to cart
exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, variantId, quantity = 1 } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new AppError("Product not found or unavailable", 404));
  }

  // Validate variant
  const variant = product.variants.id(variantId);
  if (!variant) {
    return next(new AppError("Variant not found", 404));
  }

  if (!variant.isAvailable) {
    return next(new AppError("This variant is not available", 400));
  }

  if (variant.stock < quantity) {
    return next(new AppError(`Only ${variant.stock} items available`, 400));
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if item already in cart
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.variant.toString() === variantId
  );

  if (existingItemIndex >= 0) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (newQuantity > variant.stock) {
      return next(new AppError(`Only ${variant.stock} items available`, 400));
    }

    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      variant: variantId,
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
  await cart.populate("items.product", "name slug images isActive");

  res.json({
    success: true,
    message: "Item added to cart",
    data: cart,
  });
});

// Update cart item
exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { productId, variantId, quantity } = req.body;

  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Find item in cart
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.variant.toString() === variantId
  );

  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }

  // Validate stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const variant = product.variants.id(variantId);
  if (!variant || variant.stock < quantity) {
    return next(
      new AppError(`Only ${variant?.stock || 0} items available`, 400)
    );
  }

  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = variant.price;

  await cart.save();
  await cart.populate("items.product", "name slug images isActive");

  res.json({
    success: true,
    message: "Cart updated",
    data: cart,
  });
});

// Remove from cart
exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { productId, variantId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  cart.items = cart.items.filter(
    (item) =>
      !(
        item.product.toString() === productId &&
        item.variant.toString() === variantId
      )
  );

  await cart.save();
  await cart.populate("items.product", "name slug images isActive");

  res.json({
    success: true,
    message: "Item removed from cart",
    data: cart,
  });
});

// Clear cart
exports.clearCart = catchAsync(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], coupon: null }
  );

  res.json({
    success: true,
    message: "Cart cleared",
  });
});

// Apply coupon
exports.applyCoupon = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  // Find coupon
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return next(new AppError("Invalid coupon code", 400));
  }

  // Check validity
  if (!coupon.isValid) {
    return next(new AppError("Coupon has expired or reached usage limit", 400));
  }

  // Check if user can use coupon
  const canUse = await coupon.canBeUsedBy(req.user._id);
  if (!canUse.valid) {
    return next(new AppError(canUse.message, 400));
  }

  // Calculate current subtotal
  const subtotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate discount
  const { discount, message } = coupon.calculateDiscount(subtotal);

  if (discount === 0) {
    return next(new AppError(message, 400));
  }

  // Apply coupon to cart
  cart.coupon = {
    code: coupon.code,
    discount: coupon.discountValue,
    discountType: coupon.discountType,
  };

  await cart.save();
  await cart.populate("items.product", "name slug images isActive");

  res.json({
    success: true,
    message: "Coupon applied successfully",
    data: cart,
  });
});

// Remove coupon
exports.removeCoupon = catchAsync(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $unset: { coupon: 1 } },
    { new: true }
  ).populate("items.product", "name slug images isActive");

  res.json({
    success: true,
    message: "Coupon removed",
    data: cart,
  });
});

// Validate cart
exports.validateCart = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    return res.json({
      success: true,
      valid: true,
      data: cart,
      issues: [],
    });
  }

  const issues = [];
  const validItems = [];

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      issues.push({
        type: "unavailable",
        productId: item.product?._id || item.product,
        message: `${item.name} is no longer available`,
      });
      continue;
    }

    const variant = product.variants.id(item.variant);

    if (!variant || !variant.isAvailable) {
      issues.push({
        type: "variant_unavailable",
        productId: product._id,
        variantId: item.variant,
        message: `Selected variant of ${item.name} is no longer available`,
      });
      continue;
    }

    if (variant.stock < item.quantity) {
      issues.push({
        type: "insufficient_stock",
        productId: product._id,
        variantId: item.variant,
        available: variant.stock,
        message: `Only ${variant.stock} units of ${item.name} available`,
      });

      // Update quantity to available stock
      item.quantity = variant.stock;
    }

    // Update price if changed
    if (item.price !== variant.price) {
      issues.push({
        type: "price_changed",
        productId: product._id,
        oldPrice: item.price,
        newPrice: variant.price,
        message: `Price of ${item.name} has changed`,
      });
      item.price = variant.price;
    }

    validItems.push(item);
  }

  // Update cart with valid items only
  if (issues.length > 0) {
    cart.items = validItems;
    await cart.save();
  }

  res.json({
    success: true,
    valid: issues.length === 0,
    data: cart,
    issues,
  });
});

// Merge cart (for guest to user)
exports.mergeCart = catchAsync(async (req, res) => {
  const { items } = req.body; // Array of { productId, variantId, quantity }

  if (!items || items.length === 0) {
    return res.json({
      success: true,
      message: "No items to merge",
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) continue;

    const variant = product.variants.id(item.variantId);
    if (!variant || !variant.isAvailable) continue;

    const existingIndex = cart.items.findIndex(
      (i) =>
        i.product.toString() === item.productId &&
        i.variant.toString() === item.variantId
    );

    const quantity = Math.min(item.quantity, variant.stock);

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity = Math.min(
        cart.items[existingIndex].quantity + quantity,
        variant.stock
      );
    } else {
      cart.items.push({
        product: item.productId,
        variant: item.variantId,
        quantity,
        price: variant.price,
        name: product.name,
        image: product.images[0]?.url,
        size: variant.size,
        weight: variant.weight,
        weightUnit: variant.weightUnit,
      });
    }
  }

  await cart.save();
  await cart.populate("items.product", "name slug images isActive");

  res.json({
    success: true,
    message: "Cart merged successfully",
    data: cart,
  });
});

// Save for later (placeholder)
exports.saveForLater = catchAsync(async (req, res) => {
  res.json({
    success: true,
    message: "Item saved for later",
  });
});

// Move to cart (placeholder)
exports.moveToCart = catchAsync(async (req, res) => {
  res.json({
    success: true,
    message: "Item moved to cart",
  });
});

// Get saved items (placeholder)
exports.getSavedItems = catchAsync(async (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});
