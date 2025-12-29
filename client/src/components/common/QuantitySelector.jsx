// src/components/common/QuantitySelector.jsx
import clsx from "clsx";
import { FiMinus, FiPlus } from "react-icons/fi";

const QuantitySelector = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = "md",
  className = "",
}) => {
  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10",
    lg: "h-12 w-12 text-lg",
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div
      className={clsx(
        "flex items-center border border-gray-300 rounded-xl overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={clsx(
          "flex items-center justify-center bg-gray-50 text-gray-600",
          "hover:bg-gray-100 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizes[size]
        )}
      >
        <FiMinus size={16} />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className={clsx(
          "w-12 text-center border-x border-gray-300 bg-white",
          "focus:outline-none font-medium",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          sizes[size]
        )}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={clsx(
          "flex items-center justify-center bg-gray-50 text-gray-600",
          "hover:bg-gray-100 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizes[size]
        )}
      >
        <FiPlus size={16} />
      </button>
    </div>
  );
};

export default QuantitySelector;
