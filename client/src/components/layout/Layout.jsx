// src/components/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "../cart/CartDrawer";
import { useCart } from "../../context/CartContext";

const Layout = () => {
  const { isCartOpen, setIsCartOpen } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-16 md:pt-20">
        <Outlet />
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Layout;
