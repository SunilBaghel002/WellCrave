// src/pages/Shop.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiFilter, FiX, FiGrid, FiList } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { productsAPI, categoriesAPI } from "../api/products";
import ProductGrid from "../components/product/ProductGrid";
import ProductFilters from "../components/product/ProductFilters";
import Pagination from "../components/common/Pagination";
import Select from "../components/common/Select";
import Button from "../components/common/Button";
import { SORT_OPTIONS, APP_NAME } from "../utils/constants";

const Shop = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Parse filters from URL
  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      categories:
        searchParams.get("categories")?.split(",").filter(Boolean) || [],
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      dietary: searchParams.get("dietary")?.split(",").filter(Boolean) || [],
      processing:
        searchParams.get("processing")?.split(",").filter(Boolean) || [],
      sort: searchParams.get("sort") || "-createdAt",
      page: parseInt(searchParams.get("page")) || 1,
    }),
    [searchParams]
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoriesAPI.getAll();
        setCategories(data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = {
          page: filters.page,
          limit: 12,
          sort: filters.sort,
        };

        if (filters.search) params.search = filters.search;
        if (filters.minPrice) params["basePrice[gte]"] = filters.minPrice;
        if (filters.maxPrice) params["basePrice[lte]"] = filters.maxPrice;
        if (filters.dietary.length)
          params["dietaryInfo[in]"] = filters.dietary.join(",");
        if (filters.processing.length)
          params["processingMethod[in]"] = filters.processing.join(",");
        if (category) params.category = category;

        const { data } = await productsAPI.getAll(params);
        setProducts(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.total || 0);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [filters, category]);

  // Update URL params
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();

    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      } else if (value && !Array.isArray(value)) {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change
    if (
      JSON.stringify(newFilters) !== JSON.stringify({ page: newFilters.page })
    ) {
      params.set("page", "1");
    }

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Shop - {APP_NAME}</title>
        <meta
          name="description"
          content="Browse our collection of premium dehydrated foods."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container-custom py-8">
            <h1 className="text-3xl font-display font-bold text-gray-900">
              {category
                ? category
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())
                : "All Products"}
            </h1>
            {filters.search && (
              <p className="text-gray-600 mt-2">
                Search results for "{filters.search}"
              </p>
            )}
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="flex gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24">
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  onFilterChange={updateFilters}
                  onClearFilters={clearFilters}
                />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <p className="text-gray-600">
                  Showing <span className="font-medium">{totalProducts}</span>{" "}
                  products
                </p>

                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setIsFilterOpen(true)}
                    leftIcon={<FiFilter size={18} />}
                  >
                    Filters
                  </Button>

                  {/* Sort */}
                  <Select
                    options={SORT_OPTIONS}
                    value={filters.sort}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    className="w-48"
                  />
                </div>
              </div>

              {/* Products */}
              <ProductGrid products={products} isLoading={isLoading} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setIsFilterOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed left-0 top-0 h-full w-80 bg-white z-50 overflow-y-auto lg:hidden"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  onFilterChange={(newFilters) => {
                    updateFilters(newFilters);
                    setIsFilterOpen(false);
                  }}
                  onClearFilters={() => {
                    clearFilters();
                    setIsFilterOpen(false);
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Shop;
