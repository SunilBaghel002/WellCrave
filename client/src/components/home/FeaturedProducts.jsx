// src/components/home/FeaturedProducts.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { productsAPI } from "../../api/products";
import ProductGrid from "../product/ProductGrid";
import Button from "../common/Button";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("featured");

  const tabs = [
    { id: "featured", label: "Featured" },
    { id: "best-sellers", label: "Best Sellers" },
    { id: "new-arrivals", label: "New Arrivals" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let response;
        switch (activeTab) {
          case "best-sellers":
            response = await productsAPI.getBestSellers();
            break;
          case "new-arrivals":
            response = await productsAPI.getNewArrivals();
            break;
          default:
            response = await productsAPI.getFeatured();
        }
        setProducts(response.data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  return (
    <section className="section bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary-600 font-medium"
            >
              Our Products
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2"
            >
              Explore Our Collection
            </motion.h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <ProductGrid products={products} isLoading={isLoading} columns={4} />

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/shop">
            <Button variant="outline" size="lg">
              View All Products
              <FiArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
