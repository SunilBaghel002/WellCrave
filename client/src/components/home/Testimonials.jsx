// src/components/home/Testimonials.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiMessageCircle,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai, India",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5,
    text: "The freeze-dried strawberries are absolutely amazing! They taste just like fresh berries but with an incredible crunch. Perfect for my morning smoothies and oatmeal.",
    product: "Freeze-Dried Strawberries",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    location: "Delhi, India",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 5,
    text: "I've been buying from NutriFoods for over a year now. The quality is consistently excellent, and the shipping is always on time. Highly recommended!",
    product: "Premium Trail Mix",
  },
  {
    id: 3,
    name: "Anjali Patel",
    location: "Bangalore, India",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5,
    text: "As a fitness enthusiast, I love having healthy snacks that don't compromise on nutrition. These dehydrated fruits are perfect for my post-workout recovery.",
    product: "Mixed Berries Pack",
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Chennai, India",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 5,
    text: "The trail mix is my go-to snack for hiking trips. Lightweight, nutritious, and incredibly tasty. Can't imagine trekking without it anymore!",
    product: "Adventure Trail Mix",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section className="section bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      <div className="container-custom relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-4"
          >
            <FiMessageCircle className="text-yellow-400" />
            Customer Stories
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4"
          >
            Loved by{" "}
            <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">
              Thousands
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-lg max-w-2xl mx-auto"
          >
            Join our community of health-conscious customers who have
            transformed their nutrition journey with our premium products.
          </motion.p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 border border-white/20 hover:scale-110"
          >
            <FiChevronLeft size={24} />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 border border-white/20 hover:scale-110"
          >
            <FiChevronRight size={24} />
          </button>

          {/* Testimonial Card */}
          <div className="overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="relative"
              >
                <div className="glass-dark rounded-3xl p-8 md:p-12 border border-white/10">
                  {/* Quote Icon */}
                  <div className="absolute top-8 right-8 text-6xl text-white/10 font-serif">
                    "
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/20">
                          <img
                            src={testimonials[currentIndex].avatar}
                            alt={testimonials[currentIndex].name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <HiSparkles className="text-white" size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      {/* Rating */}
                      <div className="flex justify-center md:justify-start gap-1 mb-4">
                        {[...Array(testimonials[currentIndex].rating)].map(
                          (_, i) => (
                            <FiStar
                              key={i}
                              className="fill-yellow-400 text-yellow-400"
                              size={20}
                            />
                          )
                        )}
                      </div>

                      {/* Text */}
                      <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                        "{testimonials[currentIndex].text}"
                      </p>

                      {/* Author Info */}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <div>
                          <p className="font-semibold text-lg text-white">
                            {testimonials[currentIndex].name}
                          </p>
                          <p className="text-white/60 text-sm">
                            {testimonials[currentIndex].location}
                          </p>
                        </div>
                        <div className="hidden md:block w-px h-8 bg-white/20" />
                        <div className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm">
                          Purchased: {testimonials[currentIndex].product}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-gradient-to-r from-yellow-400 to-orange-500"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
