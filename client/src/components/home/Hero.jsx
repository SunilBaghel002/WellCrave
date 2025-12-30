import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiPlay, FiCheck } from "react-icons/fi";
import Button from "../common/Button";
import { APP_NAME } from "../../utils/constants"; // Assuming APP_NAME is defined

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 lg:pt-0 flex items-center overflow-hidden bg-[#fafafa]">
      {/* Abstract Organic Shapes Background */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-primary-50/50 rounded-bl-[100px] -z-10 hidden lg:block" />
      <div className="absolute top-40 left-10 w-64 h-64 bg-secondary-100 rounded-full blur-3xl opacity-60 -z-10" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary-200 rounded-full blur-3xl opacity-40 -z-10" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary-100 rounded-full shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              <span className="text-sm font-semibold text-primary-800 tracking-wide uppercase">
                100% Organic & Preserved
              </span>
            </div>

            {/* Designed Website Name / Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 leading-[1.1] mb-6">
              Taste the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 italic pr-2">
                Purest
              </span>
              Form of Nature.
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-lg leading-relaxed">
              We freeze-dry premium produce at peak ripeness. No additives, just
              <span className="font-bold text-gray-800"> {APP_NAME} </span>{" "}
              quality.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/shop">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 rounded-full px-8"
                >
                  Start Shopping
                  <FiArrowRight className="ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-white hover:text-primary-600 hover:border-primary-200 rounded-full px-8 bg-white/50 backdrop-blur-sm"
              >
                <FiPlay className="mr-2" />
                How it Works
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary-100 rounded-full text-primary-600">
                  <FiCheck size={14} />
                </div>
                <span>Sugar Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary-100 rounded-full text-primary-600">
                  <FiCheck size={14} />
                </div>
                <span>Vegan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary-100 rounded-full text-primary-600">
                  <FiCheck size={14} />
                </div>
                <span>25 Year Shelf Life</span>
              </div>
            </div>
          </motion.div>

          {/* Right Image Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block h-[600px]"
          >
            {/* Main Hero Image with Mask */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576186726580-a816e8b12896?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 ease-out" />

            {/* Floating Glass Cards */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-8 top-12 glass-panel p-5 rounded-2xl shadow-xl max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🍓</span>
                <div>
                  <p className="font-bold text-gray-900">Vitamin C</p>
                  <p className="text-xs text-gray-500">Retained 98%</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-500 h-full w-[98%]"></div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -right-6 bottom-24 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4"
            >
              <div className="bg-secondary-100 p-3 rounded-full text-secondary-600 font-bold text-xl">
                4.9
              </div>
              <div>
                <div className="flex text-secondary-400 text-sm">★★★★★</div>
                <p className="text-xs text-gray-500 font-medium">
                  From 2k+ Reviews
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
