// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";
import { formatPrice } from "../../utils/helpers";

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <div
            className={`flex items-center gap-1 mt-2 text-sm ${
              changeType === "positive" ? "text-green-600" : "text-red-600"
            }`}
          >
            {changeType === "positive" ? (
              <FiTrendingUp size={16} />
            ) : (
              <FiTrendingDown size={16} />
            )}
            <span>{change}% vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 125430,
    totalOrders: 342,
    totalCustomers: 1247,
    totalProducts: 48,
    revenueChange: 12.5,
    ordersChange: 8.2,
    customersChange: 15.3,
    productsChange: -2.1,
  });

  const [recentOrders, setRecentOrders] = useState([
    {
      id: "DF2401-ABC123",
      customer: "John Doe",
      total: 1299,
      status: "processing",
      date: "2024-01-15",
    },
    {
      id: "DF2401-DEF456",
      customer: "Jane Smith",
      total: 2450,
      status: "shipped",
      date: "2024-01-15",
    },
    {
      id: "DF2401-GHI789",
      customer: "Mike Johnson",
      total: 899,
      status: "delivered",
      date: "2024-01-14",
    },
    {
      id: "DF2401-JKL012",
      customer: "Sarah Williams",
      total: 3200,
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: "DF2401-MNO345",
      customer: "Chris Brown",
      total: 1750,
      status: "confirmed",
      date: "2024-01-13",
    },
  ]);

  const [lowStockProducts, setLowStockProducts] = useState([
    { name: "Freeze-Dried Strawberries", stock: 5, threshold: 10 },
    { name: "Organic Mango Slices", stock: 8, threshold: 15 },
    { name: "Mixed Vegetable Chips", stock: 3, threshold: 10 },
  ]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | DehydratedFoods</title>
      </Helmet>

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatPrice(stats.totalRevenue)}
            change={stats.revenueChange}
            changeType="positive"
            icon={FiDollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            change={stats.ordersChange}
            changeType="positive"
            icon={FiShoppingCart}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            change={stats.customersChange}
            changeType="positive"
            icon={FiUsers}
            color="bg-purple-500"
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            change={Math.abs(stats.productsChange)}
            changeType={stats.productsChange >= 0 ? "positive" : "negative"}
            icon={FiPackage}
            color="bg-orange-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <Link
                to="/admin/orders"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                View All <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Order ID
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Customer
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Total
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {order.customer}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {order.date}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Low Stock Alert
              </h2>
              <FiAlertCircle className="text-orange-500" size={20} />
            </div>
            <div className="p-6 space-y-4">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Threshold: {product.threshold} units
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.stock <= 5
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))}
              <Link
                to="/admin/products"
                className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium mt-4"
              >
                Manage Inventory
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-primary-100 rounded-lg">
              <FiPackage className="text-primary-600" size={20} />
            </div>
            <span className="font-medium text-gray-900">Add Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiShoppingCart className="text-blue-600" size={20} />
            </div>
            <span className="font-medium text-gray-900">View Orders</span>
          </Link>
          <Link
            to="/admin/customers"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiUsers className="text-purple-600" size={20} />
            </div>
            <span className="font-medium text-gray-900">Customers</span>
          </Link>
          <Link
            to="/admin/coupons/new"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiTag className="text-orange-600" size={20} />
            </div>
            <span className="font-medium text-gray-900">Add Coupon</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
