// src/pages/Home.jsx
import { Helmet } from "react-helmet-async";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Benefits from "../components/home/Benefits";
import Testimonials from "../components/home/Testimonials";
import { APP_NAME } from "../utils/constants";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>{APP_NAME} - Premium Dehydrated Foods</title>
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

      {/* CTA Section */}
      <section className="section bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Ready to Start Your Healthy Journey?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of health-conscious customers who trust
            DehydratedFoods for their nutritional needs.
          </p>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Shop Now
          </a>
        </div>
      </section>
    </>
  );
};

export default Home;
