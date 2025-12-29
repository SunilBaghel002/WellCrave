// src/components/common/RatingStars.jsx
import clsx from "clsx";
import { FiStar } from "react-icons/fi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const RatingStars = ({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  showCount = false,
  count = 0,
  interactive = false,
  onChange,
  className = "",
}) => {
  const sizes = {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 28,
  };

  const iconSize = sizes[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const handleClick = (index) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={clsx("flex items-center gap-1", className)}>
      <div className={clsx("flex", interactive && "cursor-pointer")}>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar
            key={`full-${i}`}
            size={iconSize}
            className="text-yellow-400"
            onClick={() => handleClick(i)}
          />
        ))}

        {hasHalfStar && (
          <FaStarHalfAlt
            size={iconSize}
            className="text-yellow-400"
            onClick={() => handleClick(fullStars)}
          />
        )}

        {[...Array(emptyStars)].map((_, i) => (
          <FiStar
            key={`empty-${i}`}
            size={iconSize}
            className="text-gray-300"
            onClick={() => handleClick(fullStars + (hasHalfStar ? 1 : 0) + i)}
          />
        ))}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}

      {showCount && count > 0 && (
        <span className="text-sm text-gray-500 ml-1">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;
