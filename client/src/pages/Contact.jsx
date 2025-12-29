// src/pages/Contact.jsx
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiMessageSquare,
  FiHelpCircle,
  FiPackage,
} from "react-icons/fi";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Form data:", data);
    toast.success("Message sent successfully! We'll get back to you soon.");
    reset();
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: "Email Us",
      value: "hello@dehydratedfoods.com",
      link: "mailto:hello@dehydratedfoods.com",
      description: "We reply within 24 hours",
    },
    {
      icon: FiPhone,
      title: "Call Us",
      value: "+91 12345 67890",
      link: "tel:+911234567890",
      description: "Mon-Sat, 9AM-6PM IST",
    },
    {
      icon: FiMapPin,
      title: "Visit Us",
      value: "Mumbai, Maharashtra, India",
      link: "#",
      description: "Our headquarters",
    },
    {
      icon: FiClock,
      title: "Business Hours",
      value: "Mon - Sat: 9AM - 6PM",
      link: null,
      description: "Sunday closed",
    },
  ];

  const faqItems = [
    {
      icon: FiPackage,
      question: "What is your shipping policy?",
      answer:
        "We offer free shipping on orders above ₹500. Standard delivery takes 3-5 business days.",
    },
    {
      icon: FiHelpCircle,
      question: "How long do dehydrated foods last?",
      answer:
        "Our products have a shelf life of 12-24 months when stored properly in a cool, dry place.",
    },
    {
      icon: FiMessageSquare,
      question: "Do you offer bulk orders?",
      answer:
        "Yes! Contact us for bulk pricing and custom orders for businesses and events.",
    },
  ];

  const subjects = [
    { value: "general", label: "General Inquiry" },
    { value: "order", label: "Order Related" },
    { value: "product", label: "Product Question" },
    { value: "bulk", label: "Bulk Order" },
    { value: "feedback", label: "Feedback" },
    { value: "other", label: "Other" },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - DehydratedFoods</title>
        <meta
          name="description"
          content="Get in touch with DehydratedFoods. We're here to help with your questions about our products, orders, and more."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-16 md:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-white/80 text-lg">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-8 relative z-10">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <info.icon className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {info.title}
                </h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-gray-900 font-medium">{info.value}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-card">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-gray-600 mb-6">
                  Fill out the form below and we'll get back to you shortly.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="First Name"
                      placeholder="John"
                      required
                      error={errors.firstName?.message}
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      required
                      error={errors.lastName?.message}
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    leftIcon={<FiMail size={18} />}
                    error={errors.email?.message}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    })}
                  />

                  <Input
                    label="Phone (Optional)"
                    type="tel"
                    placeholder="+91 12345 67890"
                    leftIcon={<FiPhone size={18} />}
                    {...register("phone")}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors.subject ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("subject", {
                        required: "Please select a subject",
                      })}
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.value} value={subject.value}>
                          {subject.label}
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none ${
                        errors.message ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("message", {
                        required: "Message is required",
                        minLength: {
                          value: 20,
                          message: "Message must be at least 20 characters",
                        },
                      })}
                    />
                    {errors.message && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isSubmitting}
                    leftIcon={<FiSend size={18} />}
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Map & FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Map */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-card">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1635000000000!5m2!1sen!2sin"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Our Location"
                  className="w-full"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Our Office</h3>
                  <p className="text-gray-600 text-sm">
                    123 Business Park, Andheri East, Mumbai 400069, India
                  </p>
                </div>
              </div>

              {/* Quick FAQ */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {item.question}
                        </h4>
                        <p className="text-gray-600 text-sm">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-primary-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Connect With Us
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Follow us on social media for updates, recipes, and special
                  offers!
                </p>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-md transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-md transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-md transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-md transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
