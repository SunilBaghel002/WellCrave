// src/pages/ProductDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import clsx from "clsx";
import {
  FiHeart,
  FiShoppingCart,
  FiShare2,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronRight,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { productsAPI } from "../api/products";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice, getDiscountPercentage } from "../utils/helpers";
import {
  DIETARY_LABELS,
  PROCESSING_METHODS,
  APP_NAME,
} from "../utils/constants";
import RatingStars from "../components/common/RatingStars";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import QuantitySelector from "../components/common/QuantitySelector";
import Loader from "../components/common/Loader";
import ProductGrid from "../components/product/ProductGrid";
// import ProductReviews from "../components/product/ProductReviews";

const ProductDetail = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data } = await productsAPI.getBySlug(slug);
        setProduct(data.data);
        setSelectedVariant(data.data.variants?.[0]);

        // Fetch related products
        if (data.data._id) {
          const relatedResponse = await productsAPI.getRelated(data.data._id);
          setRelatedProducts(relatedResponse.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Product not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    setIsAddingToCart(true);
    await addToCart(product._id, selectedVariant._id, quantity);
    setIsAddingToCart(false);
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    await toggleWishlist(product._id);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link to="/shop" className="text-primary-600 mt-4 inline-block">
          Back to Shop
        </Link>
      </div>
    );
  }

  const {
    _id,
    name,
    images,
    description,
    shortDescription,
    basePrice,
    compareAtPrice,
    rating,
    variants,
    dietaryInfo,
    ingredients,
    nutrition,
    processingMethod,
    shelfLife,
    storageInstructions,
    certifications,
    totalStock,
  } = product;

  const currentPrice = selectedVariant?.price || basePrice;
  const currentComparePrice = selectedVariant?.compareAtPrice || compareAtPrice;
  const discount = getDiscountPercentage(currentComparePrice, currentPrice);
  const inWishlist = isInWishlist(_id);
  const isOutOfStock = selectedVariant?.stock === 0;

  const tabs = [
    { id: "description", label: "Description" },
    { id: "nutrition", label: "Nutrition" },
    { id: "reviews", label: `Reviews (${rating?.count || 0})` },
  ];

  return (
    <>
      <Helmet>
        <title>
          {name} - {APP_NAME}
        </title>
        <meta name="description" content={shortDescription} />
      </Helmet>

      <div className="bg-white">
        {/* Breadcrumb */}
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">
              Home
            </Link>
            <FiChevronRight size={14} />
            <Link to="/shop" className="hover:text-primary-600">
              Shop
            </Link>
            <FiChevronRight size={14} />
            <span className="text-gray-900 truncate">{name}</span>
          </nav>
        </div>

        {/* Product Section */}
        <div className="container-custom py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square rounded-2xl overflow-hidden bg-gray-100"
              >
                <img
                  src={images?.[selectedImage]?.url}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {images && images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={clsx(
                        "w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors",
                        selectedImage === index
                          ? "border-primary-500"
                          : "border-transparent hover:border-gray-300"
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

            {/* Details */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {discount > 0 && (
                  <Badge variant="error">-{discount}% OFF</Badge>
                )}
                {product.isNewArrival && <Badge variant="info">New</Badge>}
                {product.isBestSeller && (
                  <Badge variant="warning">Best Seller</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
                {name}
              </h1>

              {/* Rating */}
              {rating && rating.count > 0 && (
                <div className="flex items-center gap-4 mb-4">
                  <RatingStars
                    rating={rating.average}
                    showValue
                    showCount
                    count={rating.count}
                  />
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(currentPrice)}
                </span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(currentComparePrice)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-gray-600 mb-6">{shortDescription}</p>

              {/* Dietary Info */}
              {dietaryInfo && dietaryInfo.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {dietaryInfo.map((diet) => (
                    <span
                      key={diet}
                      className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full"
                    >
                      {DIETARY_LABELS[diet]?.icon}{" "}
                      {DIETARY_LABELS[diet]?.label || diet}
                    </span>
                  ))}
                </div>
              )}

              {/* Variants */}
              {variants && variants.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((variant) => (
                      <button
                        key={variant._id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className={clsx(
                          "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                          selectedVariant?._id === variant._id
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : variant.stock === 0
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 hover:border-primary-300"
                        )}
                      >
                        <span className="block">{variant.size}</span>
                        <span className="block text-xs mt-1">
                          {variant.weight}
                          {variant.weightUnit} - {formatPrice(variant.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={selectedVariant?.stock || 10}
                  disabled={isOutOfStock}
                />

                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  isLoading={isAddingToCart}
                  leftIcon={<FiShoppingCart size={20} />}
                  size="lg"
                  className="flex-1"
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleWishlist}
                  className={clsx(inWishlist && "text-red-500 border-red-500")}
                >
                  {inWishlist ? <FaHeart size={20} /> : <FiHeart size={20} />}
                </Button>

                <Button variant="ghost" size="lg" onClick={handleShare}>
                  <FiShare2 size={20} />
                </Button>
              </div>

              {/* Stock Status */}
              {selectedVariant && (
                <p
                  className={clsx(
                    "text-sm mb-6",
                    selectedVariant.stock > 10
                      ? "text-green-600"
                      : selectedVariant.stock > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {selectedVariant.stock > 10
                    ? "✓ In Stock"
                    : selectedVariant.stock > 0
                    ? `Only ${selectedVariant.stock} left in stock`
                    : "✕ Out of Stock"}
                </p>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
                <div className="text-center">
                  <FiTruck
                    className="mx-auto text-primary-600 mb-2"
                    size={24}
                  />
                  <p className="text-xs text-gray-600">
                    Free Shipping Over ₹500
                  </p>
                </div>
                <div className="text-center">
                  <FiShield
                    className="mx-auto text-primary-600 mb-2"
                    size={24}
                  />
                  <p className="text-xs text-gray-600">100% Authentic</p>
                </div>
                <div className="text-center">
                  <FiRefreshCw
                    className="mx-auto text-primary-600 mb-2"
                    size={24}
                  />
                  <p className="text-xs text-gray-600">Easy Returns</p>
                </div>
              </div>

              {/* Processing Info */}
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                {processingMethod && (
                  <p>
                    <strong>Processing:</strong>{" "}
                    {PROCESSING_METHODS[processingMethod]}
                  </p>
                )}
                {shelfLife && (
                  <p>
                    <strong>Shelf Life:</strong> {shelfLife.duration}{" "}
                    {shelfLife.unit}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="container-custom py-12">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-6 py-4 text-sm font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl">
            {activeTab === "description" && (
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-line">{description}</p>

                {ingredients && ingredients.length > 0 && (
                  <div className="mt-6">
                    <h3>Ingredients</h3>
                    <p>{ingredients.join(", ")}</p>
                  </div>
                )}

                {storageInstructions && (
                  <div className="mt-6">
                    <h3>Storage Instructions</h3>
                    <p>{storageInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "nutrition" && nutrition && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Nutrition Facts</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Serving Size: {nutrition.servingSize}
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Calories", value: nutrition.calories },
                    { label: "Total Fat", value: `${nutrition.totalFat}g` },
                    { label: "Sodium", value: `${nutrition.sodium}mg` },
                    {
                      label: "Total Carbohydrates",
                      value: `${nutrition.totalCarbohydrates}g`,
                    },
                    {
                      label: "Dietary Fiber",
                      value: `${nutrition.dietaryFiber}g`,
                    },
                    { label: "Sugars", value: `${nutrition.sugars}g` },
                    { label: "Protein", value: `${nutrition.protein}g` },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between py-2 border-b border-gray-200"
                    >
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && <ProductReviews productId={_id} />}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-gray-50 py-16">
            <div className="container-custom">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-8">
                You May Also Like
              </h2>
              <ProductGrid products={relatedProducts} columns={4} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
