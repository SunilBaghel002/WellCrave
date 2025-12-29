// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

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
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Subscribe to our newsletter
              </h3>
              <p className="text-gray-400">
                Get updates on new products and exclusive offers.
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                DehydratedFoods
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              Premium dehydrated foods crafted with care. Preserving nutrition,
              taste, and quality for your healthy lifestyle.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:hello@dehydratedfoods.com"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <FiMail size={18} />
                hello@dehydratedfoods.com
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <FiPhone size={18} />
                +91 12345 67890
              </a>
              <p className="flex items-center gap-3 text-gray-400">
                <FiMapPin size={18} />
                Mumbai, India
              </p>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors"
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
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} DehydratedFoods. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm mr-2">We accept:</span>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                  Visa
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                  Mastercard
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                  UPI
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">
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
