// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FiHome, FiShoppingBag, FiSearch } from "react-icons/fi";
import Button from "../components/common/Button";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - DehydratedFoods</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-[180px] md:text-[220px] font-bold text-gray-100 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-6xl">🍎</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>

          <p className="text-gray-600 mb-8">
            The page you're looking for seems to have dried up and disappeared.
            Don't worry, there's plenty more to explore!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button leftIcon={<FiHome size={18} />}>Back to Home</Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" leftIcon={<FiShoppingBag size={18} />}>
                Browse Products
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-4">
              Or try these popular pages:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/shop/fruits"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Dried Fruits
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/shop/vegetables"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Dried Vegetables
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/about"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                About Us
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/contact"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Contact
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
