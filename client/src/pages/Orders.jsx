// src/pages/Orders.jsx
import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { ordersAPI } from "../api/orders";
import { formatPrice, formatDate, getRelativeTime } from "../utils/helpers";
import { ORDER_STATUS, APP_NAME } from "../utils/constants";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusInfo = ORDER_STATUS[status] || { label: status, color: "gray" };

  const colorClasses = {
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
  };

  const iconMap = {
    clock: FiClock,
    check: FiCheckCircle,
    "check-circle": FiCheckCircle,
    truck: FiTruck,
    "x-circle": FiXCircle,
    refresh: FiRefreshCw,
    settings: FiPackage,
    navigation: FiTruck,
    "rotate-ccw": FiRefreshCw,
  };

  const IconComponent = iconMap[statusInfo.icon] || FiPackage;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
        colorClasses[statusInfo.color] || colorClasses.gray
      }`}
    >
      <IconComponent size={12} />
      {statusInfo.label}
    </span>
  );
};

// Empty State Component
const EmptyOrders = ({ hasFilters, onClearFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-6">
      <FiPackage size={40} className="text-teal-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {hasFilters ? "No orders found" : "No orders yet"}
    </h3>
    <p className="text-gray-500 text-center max-w-sm mb-6">
      {hasFilters
        ? "Try adjusting your filters to find what you're looking for."
        : "Looks like you haven't placed any orders yet. Start shopping to see your orders here!"}
    </p>
    {hasFilters ? (
      <Button variant="outline" onClick={onClearFilters}>
        <FiX className="mr-2" />
        Clear Filters
      </Button>
    ) : (
      <Link to="/shop">
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
          <FiShoppingBag className="mr-2" />
          Start Shopping
        </Button>
      </Link>
    )}
  </motion.div>
);

// Order Card Component
const OrderCard = ({ order, index }) => {
  const items = order.items || [];
  const firstItem = items[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/orders/${order._id}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 overflow-hidden group">
          {/* Order Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                  <FiPackage className="text-white" size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FiCalendar size={12} />
                    {formatDate(order.createdAt)}
                    <span className="text-gray-300 mx-1">•</span>
                    {getRelativeTime(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-teal-600">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <FiChevronRight
                  className="text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all"
                  size={20}
                />
              </div>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Product Images */}
              <div className="flex -space-x-3 flex-shrink-0">
                {items.slice(0, 4).map((item, i) => (
                  <div
                    key={i}
                    className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white bg-gray-100 shadow-sm"
                  >
                    <img
                      src={item.image || "https://via.placeholder.com/56"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {items.length > 4 && (
                  <div className="w-14 h-14 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-gray-600">
                      +{items.length - 4}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Names */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 font-medium truncate">
                  {items.map((item) => item.name).join(", ")}
                </p>
                {firstItem && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {firstItem.size} • {firstItem.weight}
                    {firstItem.weightUnit} × {firstItem.quantity}
                    {items.length > 1 && ` and ${items.length - 1} more`}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            {order.status === "shipped" &&
              order.tracking?.estimatedDelivery && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <FiTruck className="text-indigo-500" />
                    <span className="text-gray-600">
                      Expected delivery:{" "}
                      <span className="font-medium text-gray-900">
                        {formatDate(order.tracking.estimatedDelivery)}
                      </span>
                    </span>
                  </div>
                </div>
              )}

            {order.status === "out_for_delivery" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-cyan-600">
                  <FiTruck className="animate-bounce" />
                  <span className="font-medium">Out for delivery today!</span>
                </div>
              </div>
            )}

            {order.status === "delivered" && order.deliveredAt && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FiCheckCircle />
                  <span>Delivered on {formatDate(order.deliveredAt)}</span>
                </div>
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <FiXCircle />
                  <span>Order was cancelled</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Main Orders Component
const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Get filter values from URL params
  const statusFilter = searchParams.get("status") || "";
  const searchQuery = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page")) || 1;

  // Local state for search input
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const { data } = await ordersAPI.getMyOrders(params);

      // Handle different response structures
      const ordersData = data.data?.orders || data.data || data.orders || [];
      const paginationData = data.data?.pagination || data.pagination || {};

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setPagination({
        page: paginationData.page || currentPage,
        totalPages: paginationData.totalPages || 1,
        total: paginationData.total || ordersData.length,
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set("search", searchInput.trim());
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    const newParams = new URLSearchParams(searchParams);
    if (status) {
      newParams.set("status", status);
    } else {
      newParams.delete("status");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  // Handle page change
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const hasFilters = statusFilter || searchQuery;

  return (
    <>
      <Helmet>
        <title>My Orders | {APP_NAME}</title>
      </Helmet>

      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-24 pb-12">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                    <FiPackage className="text-white" size={24} />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    My Orders
                  </h1>
                </div>
                <p className="text-gray-600">
                  Track and manage all your orders in one place
                </p>
              </div>

              {/* Stats */}
              {!isLoading && orders.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-xl font-bold text-gray-900">
                      {pagination.total}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order number..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete("search");
                        newParams.set("page", "1");
                        setSearchParams(newParams);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={18} />
                    </button>
                  )}
                </div>
              </form>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white min-w-[160px]"
                >
                  <option value="">All Status</option>
                  {Object.entries(ORDER_STATUS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <FiX className="mr-2" size={16} />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Active filters:</span>
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                    Status: {ORDER_STATUS[statusFilter]?.label || statusFilter}
                    <button
                      onClick={() => handleStatusChange("")}
                      className="ml-1 hover:text-teal-900"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => {
                        setSearchInput("");
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete("search");
                        newParams.set("page", "1");
                        setSearchParams(newParams);
                      }}
                      className="ml-1 hover:text-teal-900"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader size="lg" />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
            >
              <FiXCircle className="mx-auto text-red-500 mb-3" size={40} />
              <p className="text-red-700 font-medium mb-2">
                Failed to load orders
              </p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button onClick={fetchOrders} variant="outline">
                <FiRefreshCw className="mr-2" />
                Try Again
              </Button>
            </motion.div>
          ) : orders.length === 0 ? (
            <EmptyOrders
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />
          ) : (
            <>
              {/* Orders List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {orders.map((order, index) => (
                    <OrderCard key={order._id} order={order} index={index} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 flex justify-center"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      )
                        .filter((page) => {
                          if (pagination.totalPages <= 5) return true;
                          if (page === 1 || page === pagination.totalPages)
                            return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                                page === currentPage
                                  ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;
