// models/Cart.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      max: [99, "Quantity cannot exceed 99"],
    },
    price: {
      type: Number,
      required: true,
    },
    name: String,
    image: String,
    size: String,
    weight: Number,
    weightUnit: String,
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    coupon: {
      code: String,
      discount: Number,
      discountType: {
        type: String,
        enum: ["percentage", "fixed"],
      },
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    notes: String,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  }
);

// Index for expiration (removed duplicate user index since it has unique: true)
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Calculate totals
cartSchema.methods.calculateTotals = function (
  taxRate = 0.18,
  freeShippingThreshold = 500,
  shippingCost = 49
) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Calculate discount
  if (this.coupon && this.coupon.code) {
    if (this.coupon.discountType === "percentage") {
      this.discount = (this.subtotal * this.coupon.discount) / 100;
    } else {
      this.discount = Math.min(this.coupon.discount, this.subtotal);
    }
  } else {
    this.discount = 0;
  }

  // Calculate shipping
  const afterDiscount = this.subtotal - this.discount;
  this.shipping = afterDiscount >= freeShippingThreshold ? 0 : shippingCost;

  // Calculate tax (GST 18%)
  this.tax = afterDiscount * taxRate;

  // Calculate total
  this.total = afterDiscount + this.shipping + this.tax;

  // Round to 2 decimal places
  this.subtotal = Math.round(this.subtotal * 100) / 100;
  this.discount = Math.round(this.discount * 100) / 100;
  this.shipping = Math.round(this.shipping * 100) / 100;
  this.tax = Math.round(this.tax * 100) / 100;
  this.total = Math.round(this.total * 100) / 100;

  return this;
};

// Pre-save middleware
cartSchema.pre("save", function (next) {
  this.calculateTotals();
  this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  next();
});

// Static method to get or create cart
cartSchema.statics.getOrCreateCart = async function (userId) {
  let cart = await this.findOne({ user: userId }).populate(
    "items.product",
    "name slug images isActive"
  );

  if (!cart) {
    cart = await this.create({ user: userId, items: [] });
  }

  return cart;
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
