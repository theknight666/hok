import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import Home from "@/pages/Home";
import Product from "@/pages/Product";
import CollectionPage from "@/pages/Collection";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import AuthCallback from "@/pages/AuthCallback";
import TrackOrder from "@/pages/TrackOrder";
import Contact from "@/pages/Contact";
import Discovery from "@/pages/Discovery";

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/fragrance/:slug" element={<Product />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/concierge" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!location.pathname.startsWith("/admin") && <Footer />}
      <CartDrawer />
    </>
  );
}

export default function App() {
  useEffect(() => {
    document.title = "House Of The Knight - Exotic Scents";
  }, []);

  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <SmoothScroll />
              <AppRouter />
            </BrowserRouter>
            <Toaster position="bottom-center" />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
