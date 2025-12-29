// src/components/home/Benefits.jsx
import { motion } from "framer-motion";
import {
  FiDroplet,
  FiClock,
  FiHeart,
  FiTruck,
  FiAward,
  FiPackage,
} from "react-icons/fi";

const benefits = [
  {
    icon: FiDroplet,
    title: "97% Nutrients Retained",
    description:
      "Our freeze-drying process preserves almost all vitamins and minerals.",
  },
  {
    icon: FiClock,
    title: "25 Years Shelf Life",
    description: "Properly stored, our products stay fresh for decades.",
  },
  {
    icon: FiHeart,
    title: "100% Natural",
    description: "No additives, preservatives, or artificial ingredients.",
  },
  {
    icon: FiTruck,
    title: "Free Shipping",
    description: "Free delivery on all orders above ₹500.",
  },
  {
    icon: FiAward,
    title: "Premium Quality",
    description: "Sourced from certified organic farms.",
  },
  {
    icon: FiPackage,
    title: "Eco-Friendly Packaging",
    description: "Sustainable packaging that protects the environment.",
  },
];

const Benefits = () => {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary-600 font-medium"
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2"
          >
            The DehydratedFoods Difference
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors"
            >
              <div className="w-14 h-14 bg-primary-100 group-hover:bg-primary-200 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <benefit.icon className="text-primary-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
