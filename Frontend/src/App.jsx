import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminProducts from "./pages/AdminProducts";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Cakes from "./pages/Cakes";
import News from "./pages/News";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import AdminOrders from "./pages/AdminOrders";
import OrderHistory from "./pages/OrderHistory";

import { getContractReadOnly } from "./contract/contract";

function App() {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Kiểm tra ví khi load app
  useEffect(() => {
    const checkWallet = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error("Check wallet error:", err);
      }
    };

    checkWallet();
  }, []);

  // Theo dõi khi user đổi account trên MetaMask
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || "");
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  // Lắng nghe event từ smart contract
  useEffect(() => {
    if (!account) return;

    const contract = getContractReadOnly();

    const handleCakeOrdered = (buyer, cakeId, qty, total) => {
      console.log("New order:", buyer, cakeId, qty, total);

      if (buyer.toLowerCase() === account.toLowerCase()) {
        window.dispatchEvent(new Event("orderUpdated"));
      }

      window.dispatchEvent(new Event("adminOrderUpdated"));
    };

    const handleDelivered = (orderId) => {
      console.log("Delivered:", orderId);
      window.dispatchEvent(new Event("orderUpdated"));
      window.dispatchEvent(new Event("adminOrderUpdated"));
    };

    try {
      contract.on("CakeOrdered", handleCakeOrdered);
      contract.on("Delivered", handleDelivered);
    } catch (err) {
      console.error("Listen contract events error:", err);
    }

    return () => {
      try {
        contract.off("CakeOrdered", handleCakeOrdered);
        contract.off("Delivered", handleDelivered);
      } catch (err) {
        console.error("Remove contract listeners error:", err);
      }
    };
  }, [account]);

  // Kiểm tra admin từ smart contract
  useEffect(() => {
    const checkAdmin = async () => {
      if (!account) {
        setIsAdmin(false);
        return;
      }

      try {
        const contract = getContractReadOnly();
        const owner = await contract.owner();

        setIsAdmin(owner.toLowerCase() === account.toLowerCase());
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
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetail account={account} />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        
        {/* User */}
        <Route
          path="/orders"
          element={account && !isAdmin ? <OrderHistory /> : <Home />}
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={isAdmin ? <AdminOrders /> : <Home />}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;