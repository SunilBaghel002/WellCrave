// src/components/home/Testimonials.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5,
    text: "The freeze-dried strawberries are absolutely amazing! They taste just like fresh berries but with an incredible crunch. Perfect for my morning smoothies and oatmeal.",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    location: "Delhi",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 5,
    text: "I've been buying from DehydratedFoods for over a year now. The quality is consistently excellent, and the shipping is always on time. Highly recommended!",
  },
  {
    id: 3,
    name: "Anjali Patel",
    location: "Bangalore",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5,
    text: "As a fitness enthusiast, I love having healthy snacks that don't compromise on nutrition. These dehydrated fruits are perfect for my post-workout recovery.",
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Chennai",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 5,
    text: "The trail mix is my go-to snack for hiking trips. Lightweight, nutritious, and incredibly tasty. Can't imagine trekking without it anymore!",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="section bg-gradient-hero text-white overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-yellow-300 font-medium"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-display font-bold mt-2"
          >
            What Our Customers Say
          </motion.h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
          >
            <FiChevronLeft size={24} />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
          >
            <FiChevronRight size={24} />
          </button>

          {/* Testimonial Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 text-center"
            >
              {/* Avatar */}
              <img
                src={testimonials[currentIndex].avatar}
                alt={testimonials[currentIndex].name}
                className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-white/30"
              />

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <FiStar
                    key={i}
                    className="fill-yellow-400 text-yellow-400"
                    size={20}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Author */}
              <p className="font-semibold text-lg">
                {testimonials[currentIndex].name}
              </p>
              <p className="text-white/70">
                {testimonials[currentIndex].location}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/30 hover:bg-white/50"
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
