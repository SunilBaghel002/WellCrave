// src/pages/Home.jsx
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight, FiMail } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Benefits from "../components/home/Benefits";
import Testimonials from "../components/home/Testimonials";
import { APP_NAME } from "../utils/constants";

// Brand Name Component
const BrandName = ({ className = "", size = "default" }) => {
  const sizeClasses = {
    small: "text-2xl",
    default: "text-4xl md:text-5xl",
    large: "text-5xl md:text-6xl lg:text-7xl",
  };

  return (
    <span
      className={`font-display font-bold ${sizeClasses[size]} ${className}`}
    >
      <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 bg-clip-text text-transparent">
        Nutri
      </span>
      <span className="relative">
        <span className="text-gray-900">Foods</span>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute -top-1 -right-4"
        >
          <HiSparkles className="text-amber-500 w-5 h-5" />
        </motion.span>
      </span>
    </span>
  );
};

const Home = () => {
  return (
    <>
      <Helmet>
        <title>{APP_NAME} - Premium Dehydrated Foods | Healthy & Natural</title>
        <meta
          name="description"
          content="Shop premium dehydrated foods including freeze-dried fruits, vegetables, and superfoods. 100% natural, long shelf life, maximum nutrition."
        />
      </Helmet>

      <Hero />
      <Categories />
      <FeaturedProducts />
      <Benefits />
      <Testimonials />

      {/* Newsletter Section */}
      <section className="section bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <FiMail className="text-primary-600" />
              Stay Updated
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
              Join the{" "}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                NutriFoods
              </span>{" "}
              Family
            </h2>

            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive offers, health tips, and
              be the first to know about new product launches.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30"
              >
                Subscribe
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4">
              🔒 No spam, ever. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
        </div>

        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-block mb-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
                <HiSparkles className="text-white w-10 h-10" />
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
              Ready to Start Your
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                Healthy Journey?
              </span>
            </h2>

            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of health-conscious customers who trust NutriFoods
              for their nutritional needs. Experience the difference today!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 rounded-xl font-semibold hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
              >
                Start Shopping
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Learn More About Us
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                {[
                  { icon: "🌿", label: "100% Organic" },
                  { icon: "🚚", label: "Free Shipping" },
                  { icon: "↩️", label: "Easy Returns" },
                  { icon: "🔒", label: "Secure Payment" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 text-white/70"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
