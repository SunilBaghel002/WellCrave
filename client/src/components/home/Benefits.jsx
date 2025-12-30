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
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: FiClock,
    title: "25 Years Shelf Life",
    description: "Properly stored, our products stay fresh for decades.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: FiHeart,
    title: "100% Natural",
    description: "No additives, preservatives, or artificial ingredients.",
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50",
  },
  {
    icon: FiTruck,
    title: "Free Shipping",
    description: "Free delivery on all orders above ₹500.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
  },
  {
    icon: FiAward,
    title: "Premium Quality",
    description: "Sourced from certified organic farms.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
  },
  {
    icon: FiPackage,
    title: "Eco-Friendly Packaging",
    description: "Sustainable packaging that protects the environment.",
    color: "from-teal-500 to-green-500",
    bgColor: "bg-teal-50",
  },
];

const Benefits = () => {
  return (
    <section className="section bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-50 to-transparent rounded-full opacity-60" />
      </div>

      <div className="container-custom relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4"
          >
            <FiAward className="text-primary-600" />
            Why Choose Us
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4"
          >
            The{" "}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              NutriFoods
            </span>{" "}
            Difference
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            We're committed to bringing you the highest quality dehydrated foods
            with unmatched benefits for your health and convenience.
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${benefit.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
              />

              <div className="relative p-8 rounded-3xl bg-white border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2">
                {/* Icon */}
                <div
                  className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center`}
                  >
                    <benefit.icon className="text-white" size={24} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>

                {/* Decorative Element */}
                <div
                  className={`absolute top-4 right-4 w-20 h-20 bg-gradient-to-r ${benefit.color} rounded-full opacity-5 group-hover:opacity-10 transition-opacity`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
