// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount cannot be negative"],
    },
    minimumPurchase: {
      type: Number,
      default: 0,
    },
    maximumDiscount: {
      type: Number,
      default: null,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    usageLimit: {
      type: Number,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFirstOrderOnly: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (removed duplicate code index since it has unique: true)
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ isActive: 1 });

// Virtual for validity
couponSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.usageLimit === null || this.usageCount < this.usageLimit)
  );
});

// Method to check if user can use coupon
couponSchema.methods.canBeUsedBy = async function (userId) {
  if (!this.isValid) {
    return { valid: false, message: "Coupon is not valid or has expired" };
  }

  // Check user usage limit
  const userUsageCount = this.usedBy.filter(
    (usage) => usage.user.toString() === userId.toString()
  ).length;

  if (userUsageCount >= this.usageLimitPerUser) {
    return {
      valid: false,
      message: "You have already used this coupon the maximum number of times",
    };
  }

  // Check first order only
  if (this.isFirstOrderOnly) {
    const Order = mongoose.model("Order");
    const orderCount = await Order.countDocuments({
      user: userId,
      "payment.status": "completed",
    });

    if (orderCount > 0) {
      return {
        valid: false,
        message: "This coupon is only valid for first-time orders",
      };
    }
  }

  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (subtotal, cartItems = []) {
  if (subtotal < this.minimumPurchase) {
    return {
      discount: 0,
      message: `Minimum purchase of ₹${this.minimumPurchase} required`,
    };
  }

  let discount = 0;

  if (this.discountType === "percentage") {
    discount = (subtotal * this.discountValue) / 100;
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount;
    }
  } else {
    discount = Math.min(this.discountValue, subtotal);
  }

  return {
    discount: Math.round(discount * 100) / 100,
    message: "Coupon applied successfully",
  };
};

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
