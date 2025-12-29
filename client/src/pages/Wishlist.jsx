// src/pages/Wishlist.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiArrowRight,
} from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatPrice, getDiscountPercentage } from "../utils/helpers";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import RatingStars from "../components/common/RatingStars";
import toast from "react-hot-toast";

const Wishlist = () => {
  const { wishlist, isLoading, fetchWishlist, removeFromWishlist, moveToCart } =
    useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMoveToCart = async (item) => {
    const product = item.product;
    const variant = product?.variants?.[0];

    if (!variant) {
      toast.error("Product variant not available");
      return;
    }

    const result = await addToCart(product._id, variant._id, 1);
    if (result.success) {
      await removeFromWishlist(product._id);
    }
  };

  const handleMoveAllToCart = async () => {
    let successCount = 0;

    for (const item of wishlist?.products || []) {
      const product = item.product;
      const variant = product?.variants?.[0];

      if (variant && product.isActive) {
        const result = await addToCart(product._id, variant._id, 1);
        if (result.success) {
          await removeFromWishlist(product._id);
          successCount++;
        }
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} item(s) moved to cart`);
    }
  };

  if (isLoading && !wishlist) {
    return <Loader fullScreen />;
  }

  const products = wishlist?.products || [];

  return (
    <>
      <Helmet>
        <title>My Wishlist | DehydratedFoods</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-500 mt-1">
                {products.length} {products.length === 1 ? "item" : "items"}{" "}
                saved
              </p>
            </div>

            {products.length > 0 && (
              <Button
                onClick={handleMoveAllToCart}
                leftIcon={<FiShoppingCart size={18} />}
              >
                Add All to Cart
              </Button>
            )}
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={<FiHeart size={48} />}
              title="Your wishlist is empty"
              description="Save items you love to your wishlist. Review them anytime and easily move them to cart."
              actionLabel="Start Shopping"
              actionLink="/shop"
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item, index) => {
                const product = item.product;
                if (!product) return null;

                const primaryImage =
                  product.images?.find((img) => img.isPrimary)?.url ||
                  product.images?.[0]?.url;
                const discount = getDiscountPercentage(
                  product.compareAtPrice,
                  product.basePrice
                );
                const isOutOfStock = product.totalStock === 0;

                return (
                  <motion.div
                    key={item._id || product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-card overflow-hidden group"
                  >
                    {/* Image */}
                    <Link
                      to={`/product/${product.slug}`}
                      className="block relative"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {discount > 0 && (
                          <Badge variant="error">-{discount}%</Badge>
                        )}
                        {isOutOfStock && (
                          <Badge variant="secondary">Out of Stock</Badge>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link
                        to={`/product/${product.slug}`}
                        className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2 mb-2"
                      >
                        {product.name}
                      </Link>

                      {product.rating?.count > 0 && (
                        <div className="mb-2">
                          <RatingStars
                            rating={product.rating.average}
                            size="sm"
                            showCount
                            count={product.rating.count}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(product.basePrice)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          fullWidth
                          onClick={() => handleMoveToCart(item)}
                          disabled={isOutOfStock}
                          leftIcon={<FiShoppingCart size={16} />}
                        >
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </Button>
                        <button
                          onClick={() => removeFromWishlist(product._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Continue Shopping */}
          {products.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Continue Shopping
                <FiArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
