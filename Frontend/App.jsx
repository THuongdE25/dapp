import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Cakes from "./pages/Cakes";
import News from "./pages/News";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Home from "./pages/home";
import ProductDetail from "./pages/ProductDetail";
import CheckOut from "./pages/checkout";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cakes" element={<Cakes />} />
        <Route path="/news" element={<News />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cakes/:category" element={<Cakes />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckOut />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
