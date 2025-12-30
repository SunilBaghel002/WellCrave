// src/pages/admin/AdminLayout.jsx
import { useState } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  FiGrid,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiTag,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiLogOut,
  FiHome,
  FiLayers,
  FiStar,
  FiBarChart2,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { icon: FiGrid, label: "Dashboard", path: "/admin" },
    { icon: FiPackage, label: "Products", path: "/admin/products" },
    { icon: FiLayers, label: "Categories", path: "/admin/categories" },
    { icon: FiShoppingCart, label: "Orders", path: "/admin/orders" },
    { icon: FiUsers, label: "Customers", path: "/admin/customers" },
    { icon: FiStar, label: "Reviews", path: "/admin/reviews" },
    { icon: FiTag, label: "Coupons", path: "/admin/coupons" },
    { icon: FiBarChart2, label: "Analytics", path: "/admin/analytics" },
    { icon: FiSettings, label: "Settings", path: "/admin/settings" },
  ];

  const NavItem = ({ item, onClick }) => (
    <NavLink
      to={item.path}
      end={item.path === "/admin"}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
          isActive
            ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
            : "text-gray-600 hover:bg-gray-100"
        )
      }
    >
      <item.icon size={20} />
      <span className={clsx("font-medium", !isSidebarOpen && "lg:hidden")}>
        {item.label}
      </span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-all duration-300",
          "lg:translate-x-0",
          isSidebarOpen ? "w-64" : "w-20",
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-gray-900">Admin</span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FiHome size={20} />
            {isSidebarOpen && (
              <span className="font-medium">Back to Store</span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full"
          >
            <FiLogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Toggle Button (Desktop) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50"
        >
          <FiChevronLeft
            size={14}
            className={clsx(
              "transition-transform",
              !isSidebarOpen && "rotate-180"
            )}
          />
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={clsx(
          "transition-all duration-300",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 h-16 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FiMenu size={24} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
