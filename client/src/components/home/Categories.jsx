// src/components/home/Categories.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { categoriesAPI } from "../../api/products";

const defaultCategories = [
  {
    _id: "1",
    name: "Fruits",
    slug: "fruits",
    icon: "🍎",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400",
    productCount: 24,
  },
  {
    _id: "2",
    name: "Vegetables",
    slug: "vegetables",
    icon: "🥕",
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400",
    productCount: 18,
  },
  {
    _id: "3",
    name: "Herbs & Spices",
    slug: "herbs-spices",
    icon: "🌿",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
    productCount: 32,
  },
  {
    _id: "4",
    name: "Trail Mixes",
    slug: "trail-mixes",
    icon: "🥜",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400",
    productCount: 12,
  },
];

const Categories = () => {
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoriesAPI.getFeatured();
        if (data.data && data.data.length > 0) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="section bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary-600 font-medium"
          >
            Categories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2"
          >
            Shop by Category
          </motion.h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/shop/${category.slug}`}
                className="group block relative rounded-2xl overflow-hidden aspect-square"
              >
                <img
                  src={category.image?.url || category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <span className="text-3xl mb-2">{category.icon}</span>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {category.productCount} Products
                  </p>

                  <div className="mt-3 flex items-center text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Shop Now
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
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
