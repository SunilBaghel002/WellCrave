// src/components/home/Categories.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { categoriesAPI } from "../../api/products";

const defaultCategories = [
  {
    _id: "1",
    name: "Dry Fruits",
    slug: "dry-fruits",
    icon: "🥜",
    color: "from-amber-400 to-orange-500",
    image: {
      url: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80",
    },
    productCount: 24,
  },
  {
    _id: "2",
    name: "Dehydrated Fruits",
    slug: "dehydrated-fruits",
    icon: "🍎",
    color: "from-red-400 to-pink-500",
    image: {
      url: "https://images.unsplash.com/photo-1596591868231-05e882a36465?w=800&q=80",
    },
    productCount: 18,
  },
  {
    _id: "3",
    name: "Spices & Masalas",
    slug: "spices-masalas",
    icon: "🌶️",
    color: "from-red-500 to-amber-500",
    image: {
      url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
    },
    productCount: 15,
  },
  {
    _id: "4",
    name: "Trail Mixes",
    slug: "trail-mixes",
    icon: "🎒",
    color: "from-green-400 to-emerald-500",
    image: {
      url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80",
    },
    productCount: 12,
  },
  {
    _id: "5",
    name: "Traditional Snacks",
    slug: "traditional-snacks",
    icon: "🍘",
    color: "from-yellow-400 to-amber-500",
    image: {
      url: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80",
    },
    productCount: 20,
  },
  {
    _id: "6",
    name: "Seeds & Superfoods",
    slug: "seeds-superfoods",
    icon: "🌻",
    color: "from-teal-400 to-cyan-500",
    image: {
      url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
    },
    productCount: 16,
  },
];

const colorMap = {
  "Dry Fruits": "from-amber-400 to-orange-500",
  "Dehydrated Fruits": "from-red-400 to-pink-500",
  "Spices & Masalas": "from-red-500 to-amber-500",
  "Trail Mixes": "from-green-400 to-emerald-500",
  "Traditional Snacks": "from-yellow-400 to-amber-500",
  "Seeds & Superfoods": "from-teal-400 to-cyan-500",
  "Dried Vegetables": "from-green-500 to-lime-500",
  "Herbs & Leaves": "from-emerald-400 to-green-500",
};

const Categories = () => {
  const [categories, setCategories] = useState(defaultCategories);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const { data } = await categoriesAPI.getFeatured();
        if (data.data && data.data.length > 0) {
          // Map the fetched categories with colors
          const mappedCategories = data.data.map((cat, i) => ({
            ...cat,
            color:
              colorMap[cat.name] ||
              defaultCategories[i % defaultCategories.length].color,
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Show only first 6 featured categories
  const displayCategories = categories.slice(0, 6);

  return (
    <section className="section bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-50 via-cyan-50 to-transparent rounded-full blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-50 via-orange-50 to-transparent rounded-full blur-3xl opacity-70 translate-y-1/2 -translate-x-1/4" />

      <div className="container-custom relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 mb-4"
            >
              <HiSparkles className="text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">
                Browse Categories
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4"
            >
              Shop by{" "}
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Category
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-lg"
            >
              Explore our curated collection of premium dehydrated foods, from
              traditional Indian snacks to modern superfoods.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-gray-900/20 hover:shadow-xl"
            >
              View All Categories
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group"
            >
              <Link
                to={`/shop?category=${
                  category.slug ||
                  category.name.toLowerCase().replace(/\s+/g, "-")
                }`}
                className="block relative rounded-3xl overflow-hidden bg-gray-100 aspect-[4/3] shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500"
              >
                {/* Background Image */}
                <img
                  src={category.image?.url || category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-0 group-hover:opacity-80 transition-opacity duration-500`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  {/* Top Badge */}
                  <div className="flex justify-between items-start">
                    <motion.div
                      animate={{
                        scale: hoveredIndex === index ? 1.1 : 1,
                        rotate: hoveredIndex === index ? [0, -5, 5, 0] : 0,
                      }}
                      transition={{ duration: 0.4 }}
                      className="text-4xl filter drop-shadow-lg"
                    >
                      {category.icon}
                    </motion.div>

                    <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900 shadow-lg">
                      {category.productCount || 0}+ Products
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-white/80 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {category.description}
                      </p>
                    )}

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: hoveredIndex === index ? 1 : 0,
                        y: hoveredIndex === index ? 0 : 10,
                      }}
                      className="flex items-center gap-2"
                    >
                      <span className="px-4 py-2 bg-white text-gray-900 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg">
                        Explore Now
                        <FiArrowUpRight size={16} />
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Animated Border */}
                <div
                  className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/30 transition-colors duration-300`}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured Categories Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              icon: "🏆",
              label: "Best Sellers",
              color: "from-amber-500 to-orange-500",
            },
            {
              icon: "🆕",
              label: "New Arrivals",
              color: "from-teal-500 to-cyan-500",
            },
            {
              icon: "🎁",
              label: "Gift Packs",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: "💰",
              label: "Best Deals",
              color: "from-green-500 to-emerald-500",
            },
          ].map((item, index) => (
            <Link
              key={item.label}
              to={`/shop?filter=${item.label.toLowerCase().replace(" ", "-")}`}
              className="group relative overflow-hidden rounded-2xl p-4 bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              />
              <div className="relative flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-semibold text-gray-800 group-hover:text-gray-900">
                  {item.label}
                </span>
                <FiArrowRight className="ml-auto text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;
