// models/Product.js
const mongoose = require("mongoose");
const slugify = require("slugify");

const nutritionSchema = new mongoose.Schema(
  {
    servingSize: { type: String, default: "30g" },
    calories: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    totalCarbohydrates: { type: Number, default: 0 },
    dietaryFiber: { type: Number, default: 0 },
    sugars: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    vitamins: [
      {
        name: String,
        amount: String,
        dailyValue: Number,
      },
    ],
    minerals: [
      {
        name: String,
        amount: String,
        dailyValue: Number,
      },
    ],
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    weightUnit: {
      type: String,
      enum: ["g", "kg", "oz", "lb"],
      default: "g",
    },
    price: {
      type: Number,
      required: true,
    },
    compareAtPrice: Number,
    sku: {
      type: String,
      required: true,
    },
    barcode: String,
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: String,
      default: "DehydratedFoods",
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String,
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    variants: [variantSchema],
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },
    costPerUnit: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    nutrition: nutritionSchema,
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    allergens: [
      {
        type: String,
        enum: [
          "gluten",
          "dairy",
          "nuts",
          "soy",
          "eggs",
          "fish",
          "shellfish",
          "wheat",
          "peanuts",
          "tree-nuts",
          "sesame",
        ],
      },
    ],
    dietaryInfo: [
      {
        type: String,
        enum: [
          "vegan",
          "vegetarian",
          "gluten-free",
          "dairy-free",
          "keto",
          "paleo",
          "organic",
          "non-gmo",
          "sugar-free",
          "low-sodium",
          "high-protein",
          "raw",
        ],
      },
    ],
    processingMethod: {
      type: String,
      enum: [
        "freeze-dried",
        "air-dried",
        "vacuum-dried",
        "sun-dried",
        "spray-dried",
        "drum-dried",
      ],
      default: "freeze-dried",
    },
    shelfLife: {
      duration: { type: Number, default: 24 },
      unit: {
        type: String,
        enum: ["days", "months", "years"],
        default: "months",
      },
    },
    storageInstructions: {
      type: String,
      default: "Store in a cool, dry place away from direct sunlight.",
    },
    preparationInstructions: String,
    origin: {
      country: String,
      region: String,
    },
    certifications: [
      {
        type: String,
        enum: [
          "usda-organic",
          "non-gmo-verified",
          "kosher",
          "halal",
          "fair-trade",
          "rainforest-alliance",
        ],
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    totalStock: {
      type: Number,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    soldCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes (removed duplicate slug index since it has unique: true)
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ "rating.average": -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });

// Virtual for reviews
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.basePrice) {
    return Math.round(
      ((this.compareAtPrice - this.basePrice) / this.compareAtPrice) * 100
    );
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual("stockStatus").get(function () {
  if (this.totalStock === 0) return "out-of-stock";
  if (this.totalStock <= this.lowStockThreshold) return "low-stock";
  return "in-stock";
});

// Pre-save middleware to create slug
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug =
      slugify(this.name, { lower: true, strict: true }) +
      "-" +
      Date.now().toString(36);
  }

  // Calculate total stock from variants
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce(
      (total, variant) => total + variant.stock,
      0
    );
  }

  next();
});

// Static method to get featured products
productSchema.statics.getFeatured = function (limit = 8) {
  return this.find({ isFeatured: true, isActive: true })
    .limit(limit)
    .populate("category", "name slug")
    .select("-variants.costPerUnit");
};

// Static method to get best sellers
productSchema.statics.getBestSellers = function (limit = 8) {
  return this.find({ isBestSeller: true, isActive: true })
    .sort({ soldCount: -1 })
    .limit(limit)
    .populate("category", "name slug")
    .select("-variants.costPerUnit");
};

// Static method to get new arrivals
productSchema.statics.getNewArrivals = function (limit = 8) {
  return this.find({ isNewArrival: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("category", "name slug")
    .select("-variants.costPerUnit");
};

// Method to update rating
productSchema.methods.updateRating = async function () {
  const Review = mongoose.model("Review");
  const stats = await Review.aggregate([
    { $match: { product: this._id, isApproved: true } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].avgRating * 10) / 10;
    this.rating.count = stats[0].count;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  await this.save();
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
