// src/pages/ProductDetail.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiStar,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiCheck,
  FiShare2,
  FiChevronRight,
} from "react-icons/fi";
import { productsAPI } from "../api/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/helpers";
import { APP_NAME } from "../utils/constants";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await productsAPI.getBySlug(slug);
        setProduct(data.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || "Product not found");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Current variant
  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants[selectedVariant] || product.variants[0];
  }, [product?.variants, selectedVariant]);

  // Price calculations
  const price = currentVariant?.price || product?.basePrice || 0;
  const compareAtPrice =
    currentVariant?.compareAtPrice || product?.compareAtPrice;
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  // In wishlist
  const inWishlist = isInWishlist?.(product?._id) || false;

  // Primary image
  const primaryImage = useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return "https://via.placeholder.com/600x600?text=No+Image";
    }
    return product.images[selectedImage]?.url || product.images[0]?.url;
  }, [product?.images, selectedImage]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!currentVariant) {
      toast.error("Please select a variant");
      return;
    }

    if (!currentVariant.isAvailable) {
      toast.error("This variant is out of stock");
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
        quantity,
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

  // Handle buy now
  const handleBuyNow = async () => {
    if (!currentVariant) {
      toast.error("Please select a variant");
      return;
    }

    setIsAddingToCart(true);

    try {
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
        quantity,
        productData
      );

      if (result.success) {
        // Navigate based on auth status
        if (isAuthenticated) {
          navigate("/checkout");
        } else {
          navigate("/login", { state: { from: { pathname: "/checkout" } } });
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle wishlist
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      navigate("/login", { state: { from: { pathname: `/product/${slug}` } } });
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

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {product.name} | {APP_NAME}
        </title>
        <meta
          name="description"
          content={product.shortDescription || product.description}
        />
      </Helmet>

      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="container-custom">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="text-gray-500 hover:text-teal-600">
              Home
            </Link>
            <FiChevronRight className="text-gray-400" size={14} />
            <Link to="/shop" className="text-gray-500 hover:text-teal-600">
              Shop
            </Link>
            {product.category && (
              <>
                <FiChevronRight className="text-gray-400" size={14} />
                <Link
                  to={`/shop?category=${
                    product.category.slug || product.category._id
                  }`}
                  className="text-gray-500 hover:text-teal-600"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <FiChevronRight className="text-gray-400" size={14} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg"
              >
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? "border-teal-500 ring-2 ring-teal-500/30"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.isNewArrival && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                    NEW ARRIVAL
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    BESTSELLER
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                {product.category && (
                  <p className="text-sm text-teal-600 font-medium mb-1">
                    {product.category.name}
                  </p>
                )}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              {product.rating?.count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={16}
                        className={
                          i < Math.round(product.rating.average)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {product.rating.average?.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({product.rating.count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(price)}
                </span>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-gray-600">{product.shortDescription}</p>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant, idx) => (
                      <button
                        key={variant._id || idx}
                        onClick={() => setSelectedVariant(idx)}
                        disabled={!variant.isAvailable}
                        className={`px-4 py-3 rounded-xl border-2 transition-all ${
                          selectedVariant === idx
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : variant.isAvailable
                            ? "border-gray-200 hover:border-teal-300"
                            : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <span className="font-medium">
                          {variant.weight}
                          {variant.weightUnit}
                        </span>
                        {variant.size && (
                          <span className="text-sm text-gray-500 ml-1">
                            ({variant.size})
                          </span>
                        )}
                        <span className="block text-sm font-semibold mt-1">
                          {formatPrice(variant.price)}
                        </span>
                        {!variant.isAvailable && (
                          <span className="text-xs text-red-500">
                            Out of Stock
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-3 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiMinus size={18} />
                    </button>
                    <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-3 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>

                  {currentVariant && (
                    <span className="text-sm text-gray-500">
                      {currentVariant.stock > 0
                        ? `${currentVariant.stock} available`
                        : "Out of stock"}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !currentVariant?.isAvailable}
                  size="lg"
                  fullWidth
                  className={
                    addedToCart
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                  }
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : addedToCart ? (
                    <>
                      <FiCheck className="mr-2" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || !currentVariant?.isAvailable}
                  variant="outline"
                  size="lg"
                  fullWidth
                >
                  Buy Now
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    inWishlist
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FiHeart className={inWishlist ? "fill-current" : ""} />
                  <span>{inWishlist ? "Saved" : "Save"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <FiShare2 />
                  <span>Share</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-2">
                    <FiTruck className="text-teal-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    Free Shipping
                  </span>
                  <span className="text-xs text-gray-500">Above ₹500</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-2">
                    <FiShield className="text-teal-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    Secure Payment
                  </span>
                  <span className="text-xs text-gray-500">100% Safe</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-2">
                    <FiRefreshCw className="text-teal-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    Easy Returns
                  </span>
                  <span className="text-xs text-gray-500">7 Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Product Description
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary Info */}
            {product.dietaryInfo && product.dietaryInfo.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Dietary Info
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.dietaryInfo.map((info, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize"
                    >
                      {info.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Info */}
            {product.nutrition && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Nutrition Facts
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Per serving ({product.nutrition.servingSize})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Calories", value: product.nutrition.calories },
                    {
                      label: "Protein",
                      value: `${product.nutrition.protein}g`,
                    },
                    {
                      label: "Carbs",
                      value: `${product.nutrition.totalCarbohydrates}g`,
                    },
                    { label: "Fat", value: `${product.nutrition.totalFat}g` },
                    {
                      label: "Fiber",
                      value: `${product.nutrition.dietaryFiber}g`,
                    },
                    { label: "Sugar", value: `${product.nutrition.sugars}g` },
                    { label: "Sodium", value: `${product.nutrition.sodium}mg` },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="font-semibold text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Storage Instructions */}
            {product.storageInstructions && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Storage Instructions
                </h3>
                <p className="text-gray-600">{product.storageInstructions}</p>
              </div>
            )}

            {/* Shelf Life */}
            {product.shelfLife && (
              <div className="mt-4">
                <p className="text-gray-600">
                  <span className="font-medium">Shelf Life:</span>{" "}
                  {product.shelfLife.duration} {product.shelfLife.unit}
                </p>
              </div>
            )}

            {/* Origin */}
            {product.origin?.country && (
              <div className="mt-4">
                <p className="text-gray-600">
                  <span className="font-medium">Origin:</span>{" "}
                  {product.origin.region && `${product.origin.region}, `}
                  {product.origin.country}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
