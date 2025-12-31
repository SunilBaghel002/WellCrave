// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const BrandLogo = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "text-xl",
    default: "text-2xl",
    large: "text-3xl",
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
          <span className="text-white font-bold text-lg md:text-xl">W</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white"
        />
      </motion.div>

      {/* Brand Name */}
      <div
        className={`font-display font-bold ${sizeClasses[size]} hidden sm:block`}
      >
        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Well
        </span>
        <span className="text-gray-800">Crave</span>
      </div>
    </Link>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: "All Products", to: "/shop" },
      { label: "Fruits", to: "/shop/fruits" },
      { label: "Vegetables", to: "/shop/vegetables" },
      { label: "Herbs & Spices", to: "/shop/herbs-spices" },
      { label: "Trail Mixes", to: "/shop/trail-mixes" },
    ],
    company: [
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Blog", to: "/blog" },
      { label: "Careers", to: "/careers" },
    ],
    support: [
      { label: "FAQs", to: "/faq" },
      { label: "Shipping Info", to: "/shipping" },
      { label: "Returns", to: "/returns" },
      { label: "Track Order", to: "/track-order" },
    ],
    legal: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Refund Policy", to: "/refund-policy" },
    ],
  };

  const socialLinks = [
    { icon: FiFacebook, href: "#", label: "Facebook" },
    { icon: FiTwitter, href: "#", label: "Twitter" },
    { icon: FiInstagram, href: "#", label: "Instagram" },
    { icon: FiYoutube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container-custom py-8 sm:py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 sm:gap-6">
            <div className="text-center md:text-left w-full md:w-auto">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                Subscribe to our newsletter
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                Get updates on new products and exclusive offers.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 md:w-72 lg:w-80 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white font-medium rounded-lg sm:rounded-xl hover:bg-primary-700 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2">
            <BrandLogo />
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-xs mt-2 sm:mt-3">
              Premium dehydrated foods crafted with care. Preserving nutrition,
              taste, and quality for your healthy lifestyle.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <a
                href="mailto:hello@dehydratedfoods.com"
                className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors break-all"
              >
                <FiMail className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                <span className="truncate">hello@dehydratedfoods.com</span>
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                <FiPhone className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                +91 12345 67890
              </a>
              <p className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                <FiMapPin className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                Mumbai, India
              </p>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Shop</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Top Row: Copyright and Social */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                © {currentYear} DehydratedFoods. All rights reserved.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3 sm:gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 sm:gap-3">
              <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">We accept:</span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-gray-400">
                <span className="px-2 py-0.5 sm:py-1 bg-gray-800 rounded text-[10px] sm:text-xs whitespace-nowrap">
                  Visa
                </span>
                <span className="px-2 py-0.5 sm:py-1 bg-gray-800 rounded text-[10px] sm:text-xs whitespace-nowrap">
                  Mastercard
                </span>
                <span className="px-2 py-0.5 sm:py-1 bg-gray-800 rounded text-[10px] sm:text-xs whitespace-nowrap">
                  UPI
                </span>
                <span className="px-2 py-0.5 sm:py-1 bg-gray-800 rounded text-[10px] sm:text-xs whitespace-nowrap">
                  Razorpay
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
