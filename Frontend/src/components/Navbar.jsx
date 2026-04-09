import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../pages/CartContext";

function Navbar({ account, setAccount, isAdmin }) {
  const { cart } = useContext(CartContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        const newUser = {
          wallet_address: accounts[0],
        };
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      }
    } catch (error) {
      console.error("Lỗi kết nối ví:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    if (setAccount) {
      setAccount("");
    }
  };

  const displayWallet =
    account || (user && user.wallet_address) || "";

  return (
    <>
      <div className="color">
        <div className="border-bottom">
          <div className="container py-3 d-flex justify-content-between align-items-center">
            <h2 className="m-0 fw-bold text-white">Cake Shop</h2>

            <div className="d-flex align-items-center gap-2">
              {displayWallet ? (
                <>
                  <span className="text-white">
                    {displayWallet.slice(0, 6)}...{displayWallet.slice(-4)}
                  </span>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-light btn-sm" to="/login">
                    Đăng nhập
                  </Link>
                  <button className="btn btn-light btn-sm" onClick={connectWallet}>
                    Connect Wallet
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
          <div className="container hover-nav">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarMenu"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarMenu">
              <ul className="navbar-nav">
                <li className="nav-item me-3">
                  <Link className="nav-link text-white" to="/">
                    Trang chủ
                  </Link>
                </li>

                <li className="nav-item dropdown me-3">
                  <Link
                    className="nav-link dropdown-toggle text-white"
                    to="/cakes"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    Bánh sinh nhật
                  </Link>

                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/cakes/petit">
                        Bánh Petit
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/cakes/tiramisu">
                        Bánh Tiramisu
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/cakes/fruit">
                        Bánh Fruit
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/cakes/chocolate">
                        Bánh Chocolate
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/cakes/yogurt">
                        Bánh Yogurt
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item me-3">
                  <Link className="nav-link text-white" to="/news">
                    Tin tức
                  </Link>
                </li>

                {displayWallet && !isAdmin && (
                  <li className="nav-item me-3">
                    <Link className="nav-link text-white" to="/orders">
                      Đơn hàng
                    </Link>
                  </li>
                )}

{isAdmin && (
  <li className="nav-item dropdown me-3">
    <span className="nav-link dropdown-toggle text-white" data-bs-toggle="dropdown">
      Quản lý
    </span>

    <ul className="dropdown-menu">
      <li>
        <Link className="dropdown-item" to="/admin/orders">
          Quản lý đơn
        </Link>
      </li>
      <li>
        <Link className="dropdown-item" to="/admin/products">
          Quản lý sản phẩm
        </Link>
      </li>
    </ul>
  </li>
)}
              </ul>

              <ul className="navbar-nav ms-auto">
                <li className="nav-item me-3">
                  <Link className="nav-link text-white" to="/cart">
                    Giỏ hàng
                    <span className="badge bg-danger ms-1">{cart.length}</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Navbar;