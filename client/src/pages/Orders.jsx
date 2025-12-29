// src/pages/Orders.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FiPackage, FiChevronRight, FiSearch, FiFilter } from "react-icons/fi";
import { ordersAPI } from "../api/orders";
import { formatPrice, formatDate } from "../utils/helpers";
import { ORDER_STATUS } from "../utils/constants";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Pagination from "../components/common/Pagination";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const { data } = await ordersAPI.getMyOrders(params);
      setOrders(data.data.orders || []);
      setTotalPages(data.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const getStatusBadge = (status) => {
    const statusInfo = ORDER_STATUS[status] || { label: status, color: "gray" };
    const colorMap = {
      yellow: "warning",
      blue: "info",
      purple: "purple",
      green: "success",
      red: "error",
      gray: "secondary",
    };
    return (
      <Badge variant={colorMap[statusInfo.color] || "secondary"}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading && orders.length === 0) {
    return <Loader fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>My Orders | DehydratedFoods</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                />
              </form>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Orders</option>
                {Object.entries(ORDER_STATUS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {orders.length === 0 ? (
            <EmptyState
              icon={<FiPackage size={48} />}
              title="No orders yet"
              description="Looks like you haven't placed any orders yet. Start shopping to see your orders here!"
              actionLabel="Start Shopping"
              actionLink="/shop"
            />
          ) : (
            <>
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/orders/${order._id}`}>
                      <div className="bg-white rounded-2xl shadow-card hover:shadow-lg transition-shadow p-6">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-semibold text-gray-900">
                                {order.orderNumber}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-gray-500">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-primary-600">
                              {formatPrice(order.total)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.items?.length} item(s)
                            </p>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-3">
                            {order.items?.slice(0, 4).map((item, i) => (
                              <div
                                key={i}
                                className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white bg-gray-100"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {order.items?.length > 4 && (
                              <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  +{order.items.length - 4}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 truncate">
                              {order.items?.map((item) => item.name).join(", ")}
                            </p>
                          </div>

                          <FiChevronRight
                            className="text-gray-400 flex-shrink-0"
                            size={20}
                          />
                        </div>

                        {/* Delivery Info */}
                        {order.status === "shipped" &&
                          order.tracking?.estimatedDelivery && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-sm text-gray-600">
                                Expected delivery:{" "}
                                <span className="font-medium text-gray-900">
                                  {formatDate(order.tracking.estimatedDelivery)}
                                </span>
                              </p>
                            </div>
                          )}

                        {order.status === "delivered" && order.deliveredAt && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-green-600">
                              ✓ Delivered on {formatDate(order.deliveredAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;
