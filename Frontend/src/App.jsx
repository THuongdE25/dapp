import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Cakes from "./pages/Cakes";
import News from "./pages/News";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Home from "./pages/home";
import ProductDetail from "./pages/ProductDetail";

function App() {
  const [account, setAccount] = useState("");

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };

    checkWallet();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || "");
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <Navbar account={account} setAccount={setAccount} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cakes" element={<Cakes account={account} />} />
        <Route path="/news" element={<News />} />
        <Route path="/cart" element={<Cart account={account} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cakes/:category" element={<Cakes account={account} />} />
        <Route path="/product/:slug" element={<ProductDetail account={account} />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;