// src/pages/About.jsx
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiAward,
  FiHeart,
  FiShield,
  FiTruck,
  FiUsers,
  FiGlobe,
  FiSun,
  FiDroplet,
} from "react-icons/fi";
import Button from "../components/common/Button";

const About = () => {
  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "50+", label: "Products" },
    { number: "15+", label: "Years Experience" },
    { number: "99%", label: "Satisfaction Rate" },
  ];

  const values = [
    {
      icon: FiHeart,
      title: "Quality First",
      description:
        "We source only the finest ingredients and maintain strict quality standards throughout our production process.",
    },
    {
      icon: FiShield,
      title: "Food Safety",
      description:
        "Our facilities are certified and regularly inspected to ensure the highest food safety standards.",
    },
    {
      icon: FiSun,
      title: "Sustainability",
      description:
        "We are committed to sustainable practices, from sourcing to packaging, minimizing our environmental impact.",
    },
    {
      icon: FiUsers,
      title: "Community",
      description:
        "We work directly with local farmers and communities, ensuring fair practices and supporting local economies.",
    },
  ];

  const processes = [
    {
      step: "01",
      title: "Sourcing",
      description:
        "We carefully select premium fruits, vegetables, and ingredients from trusted farms.",
      icon: FiGlobe,
    },
    {
      step: "02",
      title: "Cleaning & Preparation",
      description:
        "Each ingredient is thoroughly cleaned and prepared with care.",
      icon: FiDroplet,
    },
    {
      step: "03",
      title: "Dehydration",
      description:
        "Using advanced freeze-drying and air-drying techniques to preserve nutrients.",
      icon: FiSun,
    },
    {
      step: "04",
      title: "Quality Check & Packaging",
      description: "Rigorous testing before sealing in eco-friendly packaging.",
      icon: FiAward,
    },
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      bio: "15+ years in food processing industry",
    },
    {
      name: "Priya Sharma",
      role: "Head of Quality",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      bio: "Food science expert with PhD",
    },
    {
      name: "Amit Patel",
      role: "Operations Director",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      bio: "Supply chain specialist",
    },
    {
      name: "Sneha Reddy",
      role: "Head of R&D",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      bio: "Innovating new products",
    },
  ];

  return (
    <>
      <Helmet>
        <title>About Us - DehydratedFoods</title>
        <meta
          name="description"
          content="Learn about DehydratedFoods - our mission, values, and commitment to providing premium dehydrated foods."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Our Story
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Passionate about preserving nature's goodness, we bring you
              premium dehydrated foods that maintain nutrition, taste, and
              quality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary-600 font-medium mb-4 block">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Bringing Nature's Best to Your Table
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At DehydratedFoods, we believe that healthy eating should be
                convenient without compromising on quality. Our mission is to
                provide premium dehydrated foods that preserve the natural
                goodness of fruits, vegetables, and herbs.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Using state-of-the-art freeze-drying and air-drying
                technologies, we ensure that every product retains up to 97% of
                its original nutritional value while extending shelf life
                naturally.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From farm to your pantry, we maintain the highest standards of
                quality, sustainability, and food safety.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800"
                alt="Our facility"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiAward className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">ISO Certified</div>
                    <div className="text-sm text-gray-500">Quality Assured</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-600 font-medium mb-4 block">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Drives Us
            </h2>
            <p className="text-gray-600">
              Our core values guide everything we do, from sourcing to delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="text-primary-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section bg-gray-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-400 font-medium mb-4 block">
              Our Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From Farm to Your Pantry
            </h2>
            <p className="text-gray-400">
              Every step is carefully monitored to ensure the highest quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processes.map((process, index) => (
              <motion.div
                key={process.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-gray-800 mb-4">
                  {process.step}
                </div>
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <process.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{process.title}</h3>
                <p className="text-gray-400">{process.description}</p>

                {index < processes.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-800">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-600 rounded-full" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-600 font-medium mb-4 block">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet the People Behind Our Products
            </h2>
            <p className="text-gray-600">
              A dedicated team of experts passionate about quality food.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-4 inline-block">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-40 h-40 rounded-full object-cover mx-auto"
                  />
                  <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <FiUsers className="text-white" size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-primary-600 text-sm mb-2">{member.role}</p>
                <p className="text-gray-500 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-primary-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-600 font-medium mb-4 block">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                The DehydratedFoods Difference
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiAward className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Premium Quality
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Only the finest ingredients make it into our products.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiShield className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      No Preservatives
                    </h3>
                    <p className="text-gray-600 text-sm">
                      100% natural with no artificial additives or
                      preservatives.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiTruck className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Fast Delivery
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Quick and reliable shipping across India.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiHeart className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Customer Love
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Thousands of happy customers and 5-star reviews.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400"
                alt="Fresh fruits"
                className="rounded-2xl shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1597714026720-8f74c62310ba?w=400"
                alt="Dried fruits"
                className="rounded-2xl shadow-lg mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400"
                alt="Healthy snacks"
                className="rounded-2xl shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400"
                alt="Trail mix"
                className="rounded-2xl shadow-lg mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-hero text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-white/80 mb-8">
              Explore our range of premium dehydrated foods and start your
              healthy journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop">
                <Button
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-gray-100"
                >
                  Shop Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default About;
