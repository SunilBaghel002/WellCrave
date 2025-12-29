// src/components/product/ProductFilters.jsx
import { useState } from "react";
import clsx from "clsx";
import { FiChevronDown, FiX } from "react-icons/fi";
import { DIETARY_LABELS, PROCESSING_METHODS } from "../../utils/constants";
import Button from "../common/Button";

const ProductFilters = ({
  categories,
  filters,
  onFilterChange,
  onClearFilters,
  className = "",
}) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    dietary: true,
    processing: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCheckboxChange = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFilterChange({ ...filters, [filterType]: newValues });
  };

  const handlePriceChange = (type, value) => {
    onFilterChange({
      ...filters,
      [type]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : value
  );

  const FilterSection = ({ title, name, children }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleSection(name)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <FiChevronDown
          className={clsx(
            "transition-transform",
            expandedSections[name] && "rotate-180"
          )}
        />
      </button>
      {expandedSections[name] && (
        <div className="mt-4 space-y-3">{children}</div>
      )}
    </div>
  );

  return (
    <div className={clsx("bg-white rounded-2xl p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <FiX size={16} />
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Categories" name="categories">
        {categories?.map((category) => (
          <label
            key={category._id}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={filters.categories?.includes(category._id) || false}
              onChange={() => handleCheckboxChange("categories", category._id)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-600 group-hover:text-gray-900">
              {category.name}
            </span>
            <span className="text-gray-400 text-sm ml-auto">
              ({category.productCount || 0})
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" name="price">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <span className="text-gray-400">to</span>
          <div className="flex-1">
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ""}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </FilterSection>

      {/* Dietary */}
      <FilterSection title="Dietary" name="dietary">
        {Object.entries(DIETARY_LABELS).map(([key, { label, icon }]) => (
          <label
            key={key}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={filters.dietary?.includes(key) || false}
              onChange={() => handleCheckboxChange("dietary", key)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-600 group-hover:text-gray-900">
              {icon} {label}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Processing Method */}
      <FilterSection title="Processing Method" name="processing">
        {Object.entries(PROCESSING_METHODS).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={filters.processing?.includes(key) || false}
              onChange={() => handleCheckboxChange("processing", key)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-600 group-hover:text-gray-900">
              {label}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Apply Filters Button (Mobile) */}
      <div className="mt-6 lg:hidden">
        <Button fullWidth>Apply Filters</Button>
      </div>
    </div>
  );
};

export default ProductFilters;
