import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../pages/CartContext";

function Navbar({ account, setAccount, isAdmin }) {
  const { cart } = useContext(CartContext);

  //  connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài MetaMask!");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
  };

  return (
    <>
      <div className="color">
        <div className="border-bottom">
          <div className="container py-3 d-flex justify-content-between align-items-center">
            <h2 className="m-0 fw-bold text-white"> Cake Shop</h2>

            {/* Wallet */}
            {account ? (
              <span className="text-white">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            ) : (
              <button className="btn btn-light" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
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

                {/* 🟢 User Orders */}
                {account && !isAdmin && (
                  <li className="nav-item me-3">
                    <Link className="nav-link text-white" to="/orders">
                      Đơn hàng
                    </Link>
                  </li>
                )}

                {isAdmin && (
                  <li className="nav-item me-3">
                    <Link className="nav-link text-white" to="/admin">
                      Quản lý đơn
                    </Link>
                  </li>
                )}
              </ul>

              {/* Right side */}
              <ul className="navbar-nav ms-auto">
                <li className="nav-item me-3">
                  <Link className="nav-link text-white" to="/cart">
                     Giỏ hàng
                    <span className="badge bg-danger ms-1">
                      {cart.length}
                    </span>
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