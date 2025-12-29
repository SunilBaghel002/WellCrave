// src/components/cart/CartItem.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { FiTrash2, FiHeart } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice } from "../../utils/helpers";
import QuantitySelector from "../common/QuantitySelector";

const CartItem = ({ item, compact = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateQuantity, removeFromCart } = useCart();
  const { addToWishlist } = useWishlist();

  const {
    product,
    variant,
    name,
    image,
    size,
    weight,
    weightUnit,
    price,
    quantity,
  } = item;

  const handleQuantityChange = async (newQuantity) => {
    setIsUpdating(true);
    await updateQuantity(product._id || product, variant, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    await removeFromCart(product._id || product, variant);
    setIsUpdating(false);
  };

  const handleMoveToWishlist = async () => {
    await addToWishlist(product._id || product);
    await removeFromCart(product._id || product, variant);
  };

  const productSlug = product?.slug || product;

  if (compact) {
    return (
      <div className={clsx("flex gap-3 py-3", isUpdating && "opacity-50")}>
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{name}</h4>
          <p className="text-xs text-gray-500">
            {size} • Qty: {quantity}
          </p>
          <p className="text-sm font-semibold text-primary-600 mt-1">
            {formatPrice(price * quantity)}
          </p>
        </div>

        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex gap-4 py-6 border-b border-gray-200",
        isUpdating && "opacity-50 pointer-events-none"
      )}
    >
      {/* Product Image */}
      <Link
        to={`/product/${productSlug}`}
        className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              to={`/product/${productSlug}`}
              className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
            >
              {name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {size} • {weight}
              {weightUnit}
            </p>
          </div>

          <p className="text-lg font-semibold text-gray-900 flex-shrink-0">
            {formatPrice(price * quantity)}
          </p>
        </div>

        {/* Price per unit */}
        <p className="text-sm text-gray-500 mt-2">{formatPrice(price)} each</p>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <QuantitySelector
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            max={99}
            size="sm"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleMoveToWishlist}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              <FiHeart size={16} />
              <span className="hidden sm:inline">Save for later</span>
            </button>

            <button
              onClick={handleRemove}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors ml-4"
            >
              <FiTrash2 size={16} />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
