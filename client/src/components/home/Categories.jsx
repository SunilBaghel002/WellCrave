import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { categoriesAPI } from "../../api/products";

// Use placeholders initially
const defaultCategories = [
  {
    _id: "1",
    name: "Fruits",
    slug: "fruits",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500",
    count: 24,
  },
  {
    _id: "2",
    name: "Vegetables",
    slug: "vegetables",
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500",
    count: 18,
  },
  {
    _id: "3",
    name: "Herbs",
    slug: "herbs-spices",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500",
    count: 32,
  },
  {
    _id: "4",
    name: "Powders",
    slug: "powders",
    image: "https://images.unsplash.com/photo-1615485500704-8e99099928b3?w=500",
    count: 12,
  },
];

const Categories = () => {
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoriesAPI.getFeatured();
        if (data.data && data.data.length > 0) setCategories(data.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm">
              Collections
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            View All Categories <FiArrowRight className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={`/shop/${cat.slug}`}
                className="group block relative h-[320px] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gray-200 img-zoom-container">
                  <img
                    src={cat.image?.url || cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:-translate-y-1 transition-transform">
                    {cat.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">
                      {cat.count || cat.productCount || 10}+ Items
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <FiArrowRight />
                    </div>
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
