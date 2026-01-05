// src/components/product/ProductCard.jsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHeart,
  FiShoppingCart,
  FiEye,
  FiStar,
  FiCheck,
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/helpers";
import toast from "react-hot-toast";

const ProductCard = ({ product, index = 0 }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Get primary image
  const primaryImage = useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return "https://via.placeholder.com/300x300?text=No+Image";
    }
    const primary = product.images.find((img) => img.isPrimary);
    return primary?.url || product.images[0]?.url || product.images[0];
  }, [product?.images]);

  // Get current variant
  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) {
      return null;
    }
    return product.variants[selectedVariant] || product.variants[0];
  }, [product?.variants, selectedVariant]);

  // Get price info
  const price = currentVariant?.price || product?.basePrice || 0;
  const compareAtPrice =
    currentVariant?.compareAtPrice || product?.compareAtPrice;
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  // Check if in wishlist
  const inWishlist = isInWishlist?.(product?._id) || false;

  // Handle add to cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentVariant) {
      toast.error("Please select a variant");
      return;
    }

    setIsAddingToCart(true);

    try {
      // Prepare product data for guest cart
      const productData = {
        name: product.name,
        price: currentVariant.price,
        image: primaryImage,
        size: currentVariant.size,
        weight: currentVariant.weight,
        weightUnit: currentVariant.weightUnit || "g",
      };

      const result = await addToCart(
        product._id,
        currentVariant._id,
        1,
        productData // Pass product data for guest cart
      );

      if (result.success) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      navigate("/login", {
        state: { from: { pathname: window.location.pathname } },
      });
      return;
    }

    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/product/${product.slug || product._id}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-teal-200 transition-all duration-300">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discountPercent > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                  -{discountPercent}%
                </span>
              )}
              {product.isNewArrival && (
                <span className="px-2 py-1 bg-teal-500 text-white text-xs font-bold rounded-lg">
                  NEW
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">
                  BESTSELLER
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                inWishlist
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500"
              } shadow-md`}
            >
              <FiHeart size={18} className={inWishlist ? "fill-current" : ""} />
            </button>

            {/* Quick Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !currentVariant?.isAvailable}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-900 hover:bg-teal-500 hover:text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : addedToCart ? (
                    <>
                      <FiCheck size={16} />
                      Added!
                    </>
                  ) : (
                    <>
                      <FiShoppingCart size={16} />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/product/${product.slug || product._id}`);
                  }}
                  className="p-2.5 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <FiEye size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category */}
            {product.category && (
              <p className="text-xs text-teal-600 font-medium mb-1 uppercase tracking-wide">
                {product.category.name || product.category}
              </p>
            )}

            {/* Name */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating?.count > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <FiStar className="text-amber-400 fill-amber-400" size={14} />
                <span className="text-sm font-medium text-gray-700">
                  {product.rating.average?.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({product.rating.count})
                </span>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 1 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.variants.slice(0, 3).map((variant, idx) => (
                  <button
                    key={variant._id || idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariant(idx);
                    }}
                    className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                      selectedVariant === idx
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {variant.weight}
                    {variant.weightUnit}
                  </button>
                ))}
                {product.variants.length > 3 && (
                  <span className="px-2 py-1 text-xs text-gray-400">
                    +{product.variants.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(price)}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {currentVariant && !currentVariant.isAvailable && (
              <p className="text-xs text-red-500 mt-2">Out of Stock</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
