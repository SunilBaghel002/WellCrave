// models/Wishlist.js
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
        },
        notifyOnSale: {
          type: Boolean,
          default: false,
        },
        notifyOnStock: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index (removed duplicate user index since it has unique: true)
wishlistSchema.index({ "products.product": 1 });

// Static method to get or create wishlist
wishlistSchema.statics.getOrCreateWishlist = async function (userId) {
  let wishlist = await this.findOne({ user: userId }).populate(
    "products.product",
    "name slug images basePrice compareAtPrice isActive rating"
  );

  if (!wishlist) {
    wishlist = await this.create({ user: userId, products: [] });
  }

  return wishlist;
};

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
