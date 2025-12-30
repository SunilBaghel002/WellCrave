// models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
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
    name: { type: String, required: true },
    image: String,
    size: String,
    weight: Number,
    weightUnit: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    apartment: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const trackingSchema = new mongoose.Schema(
  {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    updates: [
      {
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        description: String,
      },
    ],
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    billingAddress: shippingAddressSchema,
    sameAsShipping: {
      type: Boolean,
      default: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    coupon: {
      code: String,
      discount: Number,
      discountType: String,
    },
    shipping: {
      cost: { type: Number, default: 0 },
      method: {
        type: String,
        enum: ["standard", "express", "overnight", "pickup"],
        default: "standard",
      },
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    payment: {
      method: {
        type: String,
        enum: ["razorpay", "cod", "bank_transfer", "upi", "wallet"],
        default: "razorpay",
      },
      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "completed",
          "failed",
          "refunded",
          "partially_refunded",
        ],
        default: "pending",
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      refundId: String,
      paidAt: Date,
      refundedAmount: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
        "returned",
      ],
      default: "pending",
    },
    tracking: trackingSchema,
    notes: String,
    internalNotes: String,
    giftMessage: String,
    isGift: {
      type: Boolean,
      default: false,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    returnReason: String,
    returnRequestedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes (removed duplicate orderNumber index since it has unique: true)
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ "payment.razorpayOrderId": 1 });
orderSchema.index({ "payment.razorpayPaymentId": 1 });

// Pre-save middleware to generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `DF${year}${month}-${random}`;
  }
  next();
});

// Method to add status history
orderSchema.methods.addStatusHistory = function (status, note, userId) {
  this.statusHistory.push({
    status,
    note,
    updatedBy: userId,
    timestamp: new Date(),
  });
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function () {
  const nonCancellableStatuses = [
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refunded",
  ];
  return !nonCancellableStatuses.includes(this.status);
};

// Method to check if order can be refunded
orderSchema.methods.canBeRefunded = function () {
  return (
    this.payment.status === "completed" &&
    this.payment.razorpayPaymentId &&
    this.payment.status !== "refunded"
  );
};

// Static method to get order statistics
orderSchema.statics.getStatistics = async function (startDate, endDate) {
  const matchStage = {
    "payment.status": "completed",
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$total" },
        avgOrderValue: { $avg: "$total" },
        totalItems: { $sum: { $size: "$items" } },
      },
    },
  ]);

  return (
    stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      totalItems: 0,
    }
  );
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
