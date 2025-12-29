// src/components/common/Input.jsx
import { forwardRef, useState } from "react";
import clsx from "clsx";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      type = "text",
      leftIcon,
      rightIcon,
      className = "",
      containerClassName = "",
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={clsx("w-full", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={clsx(
              "w-full px-4 py-3 rounded-xl border bg-white text-gray-900",
              "placeholder-gray-400 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:border-transparent",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary-500",
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              disabled && "bg-gray-100 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          )}

          {rightIcon && !isPassword && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
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

Input.displayName = "Input";

export default Input;
