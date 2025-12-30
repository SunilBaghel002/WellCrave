// src/components/home/Categories.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { categoriesAPI } from "../../api/products";

const defaultCategories = [
  {
    _id: "1",
    name: "Fruits",
    slug: "fruits",
    icon: "🍎",
    color: "from-red-400 to-pink-500",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400",
    productCount: 24,
  },
  {
    _id: "2",
    name: "Vegetables",
    slug: "vegetables",
    icon: "🥕",
    color: "from-green-400 to-emerald-500",
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400",
    productCount: 18,
  },
  {
    _id: "3",
    name: "Herbs & Spices",
    slug: "herbs-spices",
    icon: "🌿",
    color: "from-teal-400 to-cyan-500",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
    productCount: 32,
  },
  {
    _id: "4",
    name: "Trail Mixes",
    slug: "trail-mixes",
    icon: "🥜",
    color: "from-amber-400 to-orange-500",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400",
    productCount: 12,
  },
];

const Categories = () => {
  const [categories, setCategories] = useState(defaultCategories);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoriesAPI.getFeatured();
        if (data.data && data.data.length > 0) {
          setCategories(
            data.data.map((cat, i) => ({
              ...cat,
              color: defaultCategories[i % defaultCategories.length].color,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="section bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-100 to-transparent rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary-100 to-transparent rounded-full blur-3xl opacity-50" />

      <div className="container-custom relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Browse Categories
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900"
            >
              Shop by{" "}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Category
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
            >
              View All Categories
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link
                to={`/shop/${category.slug}`}
                className="group block relative rounded-3xl overflow-hidden bg-gray-100 aspect-[4/5]"
              >
                {/* Background Image */}
                <img
                  src={category.image?.url || category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-0 group-hover:opacity-70 transition-opacity duration-500`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: hoveredIndex === index ? 1.2 : 1,
                      y: hoveredIndex === index ? -10 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-5xl mb-4"
                  >
                    {category.icon}
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {category.productCount} Products
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-white font-medium opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <span>Explore</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FiArrowUpRight className="text-white" size={18} />
                    </div>
                  </div>
                </div>

                {/* Corner Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-900">
                  {category.productCount}+
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
