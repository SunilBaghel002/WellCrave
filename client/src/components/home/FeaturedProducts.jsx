import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { productsAPI } from "../../api/products";
import ProductGrid from "../product/ProductGrid";

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
    // ... fetching logic remains the same ...
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Mocking response for UI demo if API fails
        let response = await productsAPI.getFeatured();
        setProducts(response.data.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="flex flex-col items-center mb-12 text-center">
          <span className="text-secondary-500 font-bold uppercase tracking-wider text-sm mb-2">
            Fresh From Harvest
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-8">
            Our Best Selection
          </h2>

          {/* Modern Pill Tabs */}
          <div className="flex flex-wrap justify-center gap-2 bg-gray-100 p-1.5 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-white text-primary-600 shadow-md transform scale-105"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <ProductGrid products={products} isLoading={isLoading} columns={4} />

        <div className="text-center mt-16">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-gray-900 font-semibold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            View All Products
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
