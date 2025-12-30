// models/Category.js
const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      url: String,
      publicId: String,
    },
    icon: String,
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    ancestors: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        name: String,
        slug: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
    productCount: {
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
categorySchema.index({ parent: 1 });
categorySchema.index({ displayOrder: 1 });

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Virtual for products
categorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
});

// Pre-save middleware
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Build ancestors array
  if (this.isModified("parent") && this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.ancestors = [
        ...parent.ancestors,
        { _id: parent._id, name: parent.name, slug: parent.slug },
      ];
    }
  }

  next();
});

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true })
    .sort({ displayOrder: 1 })
    .lean();

  const buildTree = (parentId = null) => {
    return categories
      .filter((cat) => String(cat.parent) === String(parentId))
      .map((cat) => ({
        ...cat,
        children: buildTree(cat._id),
      }));
  };

  return buildTree(null);
};

// Static method to update product count
categorySchema.statics.updateProductCount = async function (categoryId) {
  const Product = mongoose.model("Product");
  const count = await Product.countDocuments({
    category: categoryId,
    isActive: true,
  });

  await this.findByIdAndUpdate(categoryId, { productCount: count });
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
