// src/components/home/Hero.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiTruck,
  FiShield,
  FiHeart,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import Button from "../common/Button";

const Hero = () => {
  const features = [
    { icon: FiCheck, text: "100% Natural" },
    { icon: FiTruck, text: "Free Delivery" },
    { icon: FiShield, text: "Quality Assured" },
  ];

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=1920&q=80"
          alt="Healthy dry fruits and nuts"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container-custom relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
            >
              <HiSparkles className="text-amber-400 w-5 h-5" />
              <span className="text-white/90 text-sm font-medium">
                Premium Quality Since 2020
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white leading-[1.1] mb-6"
            >
              Nourish Your
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Body & Soul
                </span>
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                >
                  <path
                    d="M2 8C50 2 100 2 150 8C200 14 250 6 298 8"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg lg:text-xl text-white/70 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Discover our handpicked collection of premium dry fruits,
              dehydrated snacks, and superfoods. Sourced from the finest farms,
              delivered to your doorstep.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10"
            >
              {features.map((feature, index) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <feature.icon className="text-teal-400 w-4 h-4" />
                  <span className="text-white/80 text-sm font-medium">
                    {feature.text}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/shop">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold px-8 shadow-lg shadow-teal-500/30 border-0"
                >
                  Shop Now
                  <FiArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/shop?filter=best-sellers">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <FiHeart className="mr-2" size={20} />
                  Best Sellers
                </Button>
              </Link>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <div className="grid grid-cols-3 gap-6 lg:gap-10">
                {[
                  { value: "50+", label: "Products" },
                  { value: "10K+", label: "Happy Customers" },
                  { value: "4.9", label: "Avg. Rating", suffix: "★" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="text-center lg:text-left"
                  >
                    <p className="text-2xl lg:text-3xl font-bold text-white">
                      {stat.value}
                      {stat.suffix && (
                        <span className="text-amber-400 ml-1">
                          {stat.suffix}
                        </span>
                      )}
                    </p>
                    <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Featured Products Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full h-[600px]">
              {/* Main Product Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <div className="relative mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80"
                      alt="Premium Almonds"
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                      BESTSELLER
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    California Almonds
                  </h3>
                  <p className="text-white/60 text-sm mb-3">
                    Premium quality, 250g pack
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        ₹299
                      </span>
                      <span className="text-white/40 line-through text-sm">
                        ₹349
                      </span>
                    </div>
                    <button className="p-3 bg-teal-500 hover:bg-teal-400 rounded-xl transition-colors">
                      <FiArrowRight className="text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 1 */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-10 left-0"
              >
                <div className="bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3 min-w-[200px]">
                  <div className="w-14 h-14 rounded-xl overflow-hidden">
                    <img
                      src="https://www.vocmart.com/store/imagethree/bigimg/0B0B4JK87MPDRF13.jpg"
                      alt="Cashews"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Premium Cashews
                    </p>
                    <p className="text-teal-600 font-bold">₹399</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2 */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-10 right-0"
              >
                <div className="bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3 min-w-[200px]">
                  <div className="w-14 h-14 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1553279768-865429fa0078?w=100&q=80"
                      alt="Mango Slices"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Mango Slices</p>
                    <p className="text-teal-600 font-bold">₹199</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 3 - Rating */}
              <motion.div
                animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                className="absolute top-20 right-10"
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 shadow-xl text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">⭐</span>
                    <span className="text-2xl font-bold">4.9</span>
                  </div>
                  <p className="text-white/90 text-sm">10K+ Reviews</p>
                </div>
              </motion.div>

              {/* Floating Card 4 - Delivery */}
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute bottom-32 left-10"
              >
                <div className="bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <FiTruck className="text-teal-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Free Delivery
                      </p>
                      <p className="text-gray-500 text-sm">On orders ₹500+</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-white/50 text-sm">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
