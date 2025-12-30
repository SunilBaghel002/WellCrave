// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiPackage,
  FiGrid,
  FiHome,
  FiShoppingBag,
  FiInfo,
  FiPhone,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import Button from "../common/Button";

// Brand Logo Component
const BrandLogo = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "text-xl",
    default: "text-2xl",
    large: "text-3xl",
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
          <span className="text-white font-bold text-lg md:text-xl">W</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white"
        />
      </motion.div>

      <div
        className={`font-display font-bold ${sizeClasses[size]} hidden sm:block`}
      >
        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Well
        </span>
        <span className="text-gray-800">Crave</span>
      </div>
    </Link>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);

  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside handler for user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      setSearchQuery("");
      setIsSearchOpen(false);
      // Small delay to ensure state updates before navigation
      setTimeout(() => {
        navigate(`/shop?search=${encodeURIComponent(query)}`);
      }, 100);
    } else {
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  // Cart open handler - using useCallback to prevent stale closures
  const handleCartOpen = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      openCart();
    },
    [openCart]
  );

  const navLinks = [
    { to: "/", label: "Home", icon: FiHome },
    { to: "/shop", label: "Shop", icon: FiShoppingBag },
    { to: "/about", label: "About", icon: FiInfo },
    { to: "/contact", label: "Contact", icon: FiPhone },
  ];

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100"
            : "bg-white/95 backdrop-blur-sm"
        )}
      >
        {/* Top Banner */}
        {/* <AnimatePresence>
          {!isScrolled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-center py-2 text-sm overflow-hidden"
            >
              <div className="container-custom flex items-center justify-center gap-2">
                <HiSparkles className="text-amber-300" />
                <span>Free shipping on orders above ₹500!</span>
                <span className="hidden sm:inline">• Use code</span>
                <span className="hidden sm:inline font-bold bg-white/20 px-2 py-0.5 rounded">
                  WELCOME10
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence> */}

        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20 gap-2">
            {/* Logo */}
            <div className="flex-shrink-0">
              <BrandLogo />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    clsx(
                      "relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group",
                      isActive
                        ? "text-teal-600"
                        : "text-gray-600 hover:text-teal-600"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-teal-50 rounded-xl"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {link.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsUserMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="relative p-2 md:p-2.5 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-300"
                aria-label="Search"
              >
                <FiSearch size={18} className="md:w-5 md:h-5" />
              </motion.button>

              {/* Wishlist */}
              {isAuthenticated && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/wishlist"
                    className="relative p-2.5 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-300 block"
                    aria-label="Wishlist"
                  >
                    <FiHeart size={20} />
                    <AnimatePresence>
                      {wishlistCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg shadow-rose-500/30"
                        >
                          {wishlistCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              )}

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCartOpen}
                type="button"
                className="relative p-2.5 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-300"
                aria-label="Open cart"
              >
                <FiShoppingCart size={20} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg shadow-teal-500/30"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* User Menu - Hidden on mobile, shown in mobile menu instead */}
              {isAuthenticated ? (
                <div className="relative hidden md:block">
                  <motion.button
                    ref={userButtonRef}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(false);
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center gap-2 p-1.5 pl-1.5 pr-3 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 rounded-full transition-all duration-300 border border-teal-100"
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-sm">
                        {user?.firstName?.charAt(0)}
                      </span>
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700">
                      {user?.firstName}
                    </span>
                    <FiChevronDown
                      size={14}
                      className={clsx(
                        "text-gray-500 transition-transform duration-300 hidden lg:block",
                        isUserMenuOpen && "rotate-180"
                      )}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        ref={userMenuRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-50 overflow-hidden"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 mx-2 rounded-xl mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">
                                {user?.firstName?.charAt(0)}
                                {user?.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          {[
                            {
                              to: "/profile",
                              icon: FiUser,
                              label: "My Profile",
                            },
                            {
                              to: "/orders",
                              icon: FiPackage,
                              label: "My Orders",
                            },
                            {
                              to: "/wishlist",
                              icon: FiHeart,
                              label: "Wishlist",
                            },
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsUserMenuOpen(false);
                                setIsMobileMenuOpen(false);
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-colors mx-2 rounded-lg"
                            >
                              <item.icon size={18} />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          ))}

                          {/* Admin Link */}
                          {(user?.role === "admin" ||
                            user?.role === "moderator") && (
                            <>
                              <div className="border-t border-gray-100 my-2 mx-4" />
                              <Link
                                to="/admin"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsUserMenuOpen(false);
                                  setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-2.5 text-teal-600 hover:bg-teal-50 transition-colors mx-2 rounded-lg"
                              >
                                <FiGrid size={18} />
                                <span className="font-medium">
                                  Admin Dashboard
                                </span>
                              </Link>
                            </>
                          )}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 mt-2 pt-2 mx-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 w-full rounded-lg transition-colors"
                          >
                            <FiLogOut size={18} />
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-md shadow-teal-500/25"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsSearchOpen(false);
                  setIsUserMenuOpen(false);
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="lg:hidden p-2 md:p-2.5 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-300"
                aria-label="Menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiX size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiMenu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsMobileMenuOpen(false);
                  setIsUserMenuOpen(false);
                }
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <BrandLogo size="small" />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsUserMenuOpen(false);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                  aria-label="Close menu"
                >
                  <FiX size={24} />
                </motion.button>
              </div>

              <div className="flex flex-col h-[calc(100%-80px)] overflow-y-auto">
                <nav className="p-4 space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NavLink
                        to={link.to}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMobileMenuOpen(false);
                          setIsUserMenuOpen(false);
                        }}
                        className={({ isActive }) =>
                          clsx(
                            "flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all",
                            isActive
                              ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/25"
                              : "text-gray-700 hover:bg-gray-50"
                          )
                        }
                      >
                        <link.icon size={20} />
                        {link.label}
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>

                <div className="border-t border-gray-100 mx-4" />

                <div className="p-4 space-y-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      setIsUserMenuOpen(false);
                      handleCartOpen(e);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <span className="flex items-center gap-3 font-medium">
                      <FiShoppingCart size={20} />
                      Shopping Cart
                    </span>
                    {totalItems > 0 && (
                      <span className="px-2.5 py-1 bg-teal-100 text-teal-700 text-sm font-semibold rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </button>

                  {isAuthenticated && (
                    <Link
                      to="/wishlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileMenuOpen(false);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <span className="flex items-center gap-3 font-medium">
                        <FiHeart size={20} />
                        Wishlist
                      </span>
                      {wishlistCount > 0 && (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-sm font-semibold rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  )}
                </div>

                <div className="flex-1" />

                <div className="p-4 border-t border-gray-100">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user?.firstName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/profile"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileMenuOpen(false);
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
                        >
                          <FiUser size={18} />
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileMenuOpen(false);
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
                        >
                          <FiPackage size={18} />
                          Orders
                        </Link>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMobileMenuOpen(false);
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-medium transition-colors"
                      >
                        <FiLogOut size={18} />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMobileMenuOpen(false);
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full"
                      >
                        <Button
                          variant="outline"
                          fullWidth
                          className="border-teal-200 text-teal-600 hover:bg-teal-50"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link
                        to="/register"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMobileMenuOpen(false);
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full"
                      >
                        <Button
                          fullWidth
                          className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                        >
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsSearchOpen(false);
                setSearchQuery("");
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="container-custom pt-20 md:pt-32"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiSearch size={24} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, categories..."
                    autoFocus
                    className="w-full pl-16 pr-16 py-5 md:py-6 text-lg md:text-xl rounded-2xl bg-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 border-0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                    aria-label="Close search"
                  >
                    <FiX size={24} />
                  </button>
                </form>

                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <span className="text-white/70 text-sm">Popular:</span>
                  {["Almonds", "Trail Mix", "Mango Slices", "Cashews"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchOpen(false);
                          setTimeout(() => {
                            navigate(`/shop?search=${encodeURIComponent(term)}`);
                          }, 100);
                        }}
                        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors backdrop-blur-sm"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
