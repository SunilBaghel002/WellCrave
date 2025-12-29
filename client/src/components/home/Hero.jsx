// src/components/home/Hero.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import Button from "../common/Button";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6">
              🌿 100% Natural & Organic
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
              Premium Dehydrated Foods for a{" "}
              <span className="text-yellow-300">Healthier</span> You
            </h1>

            <p className="text-lg text-white/80 mb-8 max-w-xl">
              Discover our range of freeze-dried fruits, vegetables, and
              superfoods. Preserved at peak freshness to retain maximum
              nutrition and incredible taste.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-gray-100"
                >
                  Shop Now
                  <FiArrowRight className="ml-2" size={20} />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                <FiPlay className="mr-2" size={20} />
                Watch Video
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl font-bold text-white">25+</p>
                <p className="text-white/70 text-sm">Years Shelf Life</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">97%</p>
                <p className="text-white/70 text-sm">Nutrients Retained</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">50k+</p>
                <p className="text-white/70 text-sm">Happy Customers</p>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800"
                alt="Dehydrated fruits and vegetables"
                className="rounded-3xl shadow-2xl"
              />

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -left-10 top-20 bg-white rounded-2xl p-4 shadow-xl"
              >
                <p className="text-sm font-medium text-gray-900">
                  🍓 Freeze-Dried
                </p>
                <p className="text-xs text-gray-500">Strawberries</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -right-10 bottom-20 bg-white rounded-2xl p-4 shadow-xl"
              >
                <p className="text-sm font-medium text-gray-900">🥭 Organic</p>
                <p className="text-xs text-gray-500">Mango Slices</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
