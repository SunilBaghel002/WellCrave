// src/components/common/Select.jsx
import { forwardRef } from "react";
import clsx from "clsx";
import { FiChevronDown } from "react-icons/fi";

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = "Select an option",
      className = "",
      containerClassName = "",
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx("w-full", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={clsx(
              "w-full px-4 py-3 rounded-xl border bg-white text-gray-900",
              "appearance-none cursor-pointer transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:border-transparent",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary-500",
              disabled && "bg-gray-100 cursor-not-allowed",
              className
            )}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiChevronDown className="text-gray-400" size={18} />
          </div>
        </div>

        {(error || helperText) && (
          <p
            className={clsx(
              "mt-2 text-sm",
              error ? "text-red-600" : "text-gray-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
