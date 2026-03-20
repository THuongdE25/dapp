import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../pages/CartContext";
function Navbar() {
  const { cart } = useContext(CartContext);
  // const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <>
      <div className="color">
        <div className="border-bottom">
          <div className="container py-3">
            <h2 className="m-0 fw-bold text-white">🍰 Cake Shop</h2>
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
              </ul>

              <ul className="navbar-nav ms-auto">
                <li className="nav-item me-3">
                  <Link className="nav-link text-white" to="/cart">
                    🛒 Giỏ hàng
                    <span className="badge bg-danger ms-1">{cart.length}</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link login text-white" to="/login">
                    Đăng Nhập
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
