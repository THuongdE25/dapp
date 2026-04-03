import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Cakes from "./pages/Cakes";
import News from "./pages/News";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import AdminOrders from "./pages/AdminOrders";
import OrderHistory from "./pages/OrderHistory";

import { getContractReadOnly } from "./contract/contract";

function App() {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check wallet khi load
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

  //đổi account
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || "");
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // cleanup
    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);
  useEffect(() => {
  const setupListeners = async () => {
    const contract = getContractReadOnly();

    contract.on("CakeOrdered", (buyer, cakeId, qty, total) => {
      console.log("New order:", buyer, cakeId, qty, total);
      // Nếu user hiện tại là buyer → reload OrderHistory
      if (buyer.toLowerCase() === account.toLowerCase()) {
        window.dispatchEvent(new Event("orderUpdated"));
      }
      // Admin sẽ luôn reload AdminOrders
      window.dispatchEvent(new Event("adminOrderUpdated"));
    });

    contract.on("Delivered", (orderId) => {
      window.dispatchEvent(new Event("orderUpdated"));
      window.dispatchEvent(new Event("adminOrderUpdated"));
    });
  };

  if (account) setupListeners();

  return () => {
    const contract = getContractReadOnly();
    contract.removeAllListeners("CakeOrdered");
    contract.removeAllListeners("Delivered");
  };
}, [account]);
  // Check admin từ smart contract
  useEffect(() => {
    const checkAdmin = async () => {
      if (!account) {
        setIsAdmin(false);
        return;
      }

      try {
        const contract = getContractReadOnly();
        const owner = await contract.owner();

        setIsAdmin(
          owner.toLowerCase() === account.toLowerCase()
        );
      } catch (err) {
        console.error("Check admin error:", err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [account]);

  return (
    <BrowserRouter>
      <Navbar
        account={account}
        setAccount={setAccount}
        isAdmin={isAdmin}
      />

      <Routes>
  {/* Public */}
  <Route path="/" element={<Home />} />
  <Route path="/cakes" element={<Cakes account={account} />} />
  <Route path="/cakes/:category" element={<Cakes account={account} />} />
  <Route path="/news" element={<News />} />
  <Route path="/cart" element={<Cart account={account} />} />
  <Route path="/product/:slug" element={<ProductDetail account={account} />} />

  {/* 👤 USER - chỉ khi có ví và KHÔNG phải admin */}
  <Route
    path="/orders"
    element={
      account && !isAdmin ? (
        <OrderHistory />
      ) : (
        <Home />
      )
    }
  />

  {/* 👑 ADMIN - chỉ owner */}
  <Route
    path="/admin"
    element={
      isAdmin ? (
        <AdminOrders />
      ) : (
        <Home />
      )
    }
  />
</Routes>


      <Footer />
    </BrowserRouter>
  );
}

export default App;