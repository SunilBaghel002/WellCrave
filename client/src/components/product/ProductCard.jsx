// src/components/product/ProductCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";
import { FiHeart, FiShoppingCart, FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice, getDiscountPercentage } from "../../utils/helpers";
import RatingStars from "../common/RatingStars";
import Badge from "../common/Badge";
import toast from "react-hot-toast";

const ProductCard = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const {
    isInWishlist,
    toggleWishlist,
    isLoading: wishlistLoading,
  } = useWishlist();

  const {
    _id,
    name,
    slug,
    images,
    basePrice,
    compareAtPrice,
    rating,
    variants,
    dietaryInfo,
    isFeatured,
    isNewArrival,
    isBestSeller,
    totalStock,
  } = product;

  const primaryImage =
    images?.find((img) => img.isPrimary)?.url || images?.[0]?.url;
  const secondaryImage = images?.[1]?.url;
  const discount = getDiscountPercentage(compareAtPrice, basePrice);
  const inWishlist = isInWishlist(_id);
  const isOutOfStock = totalStock === 0;
  const defaultVariant = variants?.[0];

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    setIsAddingToCart(true);
    await addToCart(_id, defaultVariant?._id, 1);
    setIsAddingToCart(false);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    await toggleWishlist(_id);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/product/${slug}`}>
        <div
          className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {/* Primary Image */}
            <img
              src={primaryImage}
              alt={name}
              className={clsx(
                "w-full h-full object-cover transition-all duration-500",
                isHovered && secondaryImage ? "opacity-0" : "opacity-100"
              )}
            />

            {/* Secondary Image (on hover) */}
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={name}
                className={clsx(
                  "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              />
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {isNewArrival && <Badge variant="info">New</Badge>}
              {isBestSeller && <Badge variant="warning">Best Seller</Badge>}
              {discount > 0 && <Badge variant="error">-{discount}%</Badge>}
              {isOutOfStock && <Badge variant="secondary">Out of Stock</Badge>}
            </div>

            {/* Action Buttons */}
            <div
              className={clsx(
                "absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300",
                isHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4"
              )}
            >
              <button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className={clsx(
                  "p-2.5 rounded-full shadow-md transition-all duration-200",
                  inWishlist
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
                )}
              >
                {inWishlist ? <FaHeart size={18} /> : <FiHeart size={18} />}
              </button>

              <button
                onClick={handleQuickView}
                className="p-2.5 bg-white rounded-full shadow-md text-gray-600 hover:bg-gray-50 transition-all duration-200"
              >
                <FiEye size={18} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <div
              className={clsx(
                "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300",
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-full"
              )}
            >
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || isOutOfStock}
                className={clsx(
                  "w-full py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200",
                  isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                )}
              >
                <FiShoppingCart size={18} />
                {isAddingToCart
                  ? "Adding..."
                  : isOutOfStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Dietary Tags */}
            {dietaryInfo && dietaryInfo.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {dietaryInfo.slice(0, 3).map((diet) => (
                  <span
                    key={diet}
                    className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                  >
                    {diet}
                  </span>
                ))}
              </div>
            )}

            {/* Product Name */}
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {name}
            </h3>

            {/* Rating */}
            {rating && rating.count > 0 && (
              <div className="mb-2">
                <RatingStars
                  rating={rating.average}
                  size="sm"
                  showValue
                  showCount
                  count={rating.count}
                />
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(basePrice)}
              </span>
              {compareAtPrice && compareAtPrice > basePrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>

            {/* Variants Preview */}
            {variants && variants.length > 1 && (
              <p className="text-xs text-gray-500 mt-2">
                {variants.length} sizes available
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
