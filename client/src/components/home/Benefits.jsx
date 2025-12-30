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
    title: "97% Nutrients",
    desc: "Lock in vitamins with advanced freeze-drying.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: FiClock,
    title: "25 Years Shelf Life",
    desc: "Pantry staples that last for decades.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: FiHeart,
    title: "100% Natural",
    desc: "Zero additives, just pure food.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: FiTruck,
    title: "Free Shipping",
    desc: "On all orders above ₹500.",
    color: "bg-primary-50 text-primary-600",
  },
  {
    icon: FiAward,
    title: "Certified Organic",
    desc: "Sourced strictly from certified farms.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: FiPackage,
    title: "Eco-Friendly",
    desc: "Biodegradable packaging materials.",
    color: "bg-green-50 text-green-600",
  },
];

const Benefits = () => {
  return (
    <section className="section bg-secondary-50/50">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary-600 font-bold uppercase tracking-wider text-sm">
            Our Promise
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">
            Why We Are <span className="text-primary-600">Different</span>
          </h2>
          <p className="text-gray-500 mt-4">
            We don't just dry food; we preserve the essence of nature using
            state-of-the-art technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all border border-gray-100"
            >
              <div
                className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 text-xl`}
              >
                <item.icon size={26} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
