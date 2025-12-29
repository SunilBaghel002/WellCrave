// src/components/product/ProductQuickView.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { FiX, FiHeart, FiShoppingCart, FiExternalLink } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice, getDiscountPercentage } from "../../utils/helpers";
import RatingStars from "../common/RatingStars";
import Button from "../common/Button";
import QuantitySelector from "../common/QuantitySelector";
import Badge from "../common/Badge";
import toast from "react-hot-toast";

const ProductQuickView = ({ product, isOpen, onClose }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const {
    _id,
    name,
    slug,
    images,
    shortDescription,
    basePrice,
    compareAtPrice,
    rating,
    variants,
    dietaryInfo,
    totalStock,
  } = product;

  const currentVariant = selectedVariant || variants?.[0];
  const discount = getDiscountPercentage(
    currentVariant?.compareAtPrice || compareAtPrice,
    currentVariant?.price || basePrice
  );
  const inWishlist = isInWishlist(_id);
  const isOutOfStock = currentVariant?.stock === 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    setIsAddingToCart(true);
    await addToCart(_id, currentVariant?._id, quantity);
    setIsAddingToCart(false);
    onClose();
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    await toggleWishlist(_id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>

              <div className="grid md:grid-cols-2">
                {/* Image Gallery */}
                <div className="p-6 bg-gray-50">
                  <div className="aspect-square rounded-xl overflow-hidden bg-white mb-4">
                    <img
                      src={images?.[selectedImage]?.url}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {images && images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={clsx(
                            "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                            selectedImage === index
                              ? "border-primary-500"
                              : "border-transparent"
                          )}
                        >
                          <img
                            src={image.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-6 flex flex-col">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {discount > 0 && (
                      <Badge variant="error">-{discount}% OFF</Badge>
                    )}
                    {isOutOfStock && (
                      <Badge variant="secondary">Out of Stock</Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {name}
                  </h2>

                  {/* Rating */}
                  {rating && rating.count > 0 && (
                    <div className="mb-3">
                      <RatingStars
                        rating={rating.average}
                        showValue
                        showCount
                        count={rating.count}
                      />
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(currentVariant?.price || basePrice)}
                    </span>
                    {(currentVariant?.compareAtPrice || compareAtPrice) && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(
                          currentVariant?.compareAtPrice || compareAtPrice
                        )}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6">{shortDescription}</p>

                  {/* Dietary Tags */}
                  {dietaryInfo && dietaryInfo.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {dietaryInfo.map((diet) => (
                        <span
                          key={diet}
                          className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Variants */}
                  {variants && variants.length > 1 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((variant) => (
                          <button
                            key={variant._id}
                            onClick={() => setSelectedVariant(variant)}
                            disabled={variant.stock === 0}
                            className={clsx(
                              "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                              currentVariant?._id === variant._id
                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                : variant.stock === 0
                                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                : "border-gray-300 hover:border-primary-300"
                            )}
                          >
                            {variant.size} ({variant.weight}
                            {variant.weightUnit})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <QuantitySelector
                      value={quantity}
                      onChange={setQuantity}
                      max={currentVariant?.stock || 10}
                      disabled={isOutOfStock}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    <Button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || isAddingToCart}
                      isLoading={isAddingToCart}
                      leftIcon={<FiShoppingCart size={18} />}
                      className="flex-1"
                    >
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleToggleWishlist}
                      className={clsx(
                        inWishlist &&
                          "text-red-500 border-red-500 hover:bg-red-50"
                      )}
                    >
                      {inWishlist ? (
                        <FaHeart size={18} />
                      ) : (
                        <FiHeart size={18} />
                      )}
                    </Button>
                  </div>

                  {/* View Full Details Link */}
                  <Link
                    to={`/product/${slug}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Full Details
                    <FiExternalLink size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickView;
