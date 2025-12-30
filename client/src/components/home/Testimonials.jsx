import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { FaQuoteRight } from "react-icons/fa";

// Data remains the same...
const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Nutritionist",
    text: "The nutrient retention in these products is undeniable. As a nutritionist, I recommend them for busy professionals.",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul Mehta",
    role: "Hiker",
    text: "Lightweight, delicious, and energetic. The trail mixes are now an essential part of my hiking gear.",
    rating: 5,
  },
  {
    id: 3,
    name: "Anjali Patel",
    role: "Mother",
    text: "My kids love the strawberry chips! Finally a healthy snack that I don't have to force them to eat.",
    rating: 5,
  },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="section bg-primary-900 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Text */}
          <div>
            <span className="text-secondary-400 font-bold uppercase tracking-wider text-sm">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-6 leading-tight">
              Loved by <br />{" "}
              <span className="text-primary-300">Health Enthusiasts</span>
            </h2>
            <p className="text-primary-100/80 text-lg mb-8 max-w-md">
              Join thousands of happy customers who have switched to a healthier
              lifestyle with our products.
            </p>
            <div className="flex gap-4">
              <button
                onClick={prev}
                className="p-4 rounded-full border border-primary-700 hover:bg-primary-800 transition-colors"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="p-4 rounded-full border border-primary-700 hover:bg-primary-800 transition-colors"
              >
                <FiChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Right Card */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="bg-primary-800/50 backdrop-blur-md p-10 md:p-12 rounded-[2.5rem] border border-primary-700/50"
              >
                <FaQuoteRight className="text-4xl text-primary-600 mb-6" />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="fill-secondary-400 text-secondary-400"
                    />
                  ))}
                </div>
                <p className="text-xl md:text-2xl font-display font-medium leading-relaxed mb-8">
                  "{testimonials[index].text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center font-bold text-xl">
                    {testimonials[index].name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">
                      {testimonials[index].name}
                    </h4>
                    <span className="text-primary-300 text-sm">
                      {testimonials[index].role}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
