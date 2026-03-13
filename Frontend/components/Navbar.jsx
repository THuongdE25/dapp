function Navbar() {
  return (
    <>
      <div className="color">
        <div className="border-bottom">
          <div className="container py-3">
            <h2 className="m-0 fw-bold text-white">🍰 Cake Shop</h2>
          </div>
        </div>

        <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
          <div className="container">
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
                  <a className="nav-link text-white" href="#">
                    Trang chủ
                  </a>
                </li>

                <li className="nav-item me-3">
                  <a className="nav-link text-white" href="#">
                    Bánh sinh nhật
                  </a>
                </li>

                <li className="nav-item me-3">
                  <a className="nav-link text-white" href="#">
                    Tin Tức
                  </a>
                </li>
              </ul>

              <ul className="navbar-nav ms-auto">
                <li className="nav-item me-3">
                  <a className="nav-link text-white" href="#">
                    🛒 Giỏ hàng
                    <span className="badge bg-danger ms-1">0</span>
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link login text-white" href="#">
                    Đăng Nhập
                  </a>
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
