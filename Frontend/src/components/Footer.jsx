function Footer() {
  return (
    <>
      <footer className="footer mt-5">
        <div className="container py-5">
          <div className="row">
            <div className="col-md-3">
              <h5 className="fw-bold">🍰 Cake Shop</h5>
              <p>
                Chuyên cung cấp bánh sinh nhật, bánh kem tươi với nguyên liệu
                chất lượng cao
              </p>
            </div>

            <div className="col-md-3">
              <h6 className="fw-bold">Thông tin</h6>
              <ul className="list-unstyled">
                <li>Giới thiệu</li>
                <li>Tin tức</li>
                <li>Khuyến mãi</li>
              </ul>
            </div>

            <div className="col-md-3">
              <h6 className="fw-bold">Hỗ trợ</h6>
              <ul className="list-unstyled">
                <li>Chính sách giao hàng</li>
                <li>Chính sách đổi trả</li>
                <li>Điều khoản</li>
              </ul>
            </div>

            <div className="col-md-3">
              <h6 className="fw-bold">Liên hệ</h6>
              <p>📍 Hà Nội</p>
              <p>📞 0123 456 789</p>
              <p>✉ cakeshop@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom text-center py-3">© 2026 Cake Shop - All Rights Reserved</div>
      </footer>
    </>
  );
}
export default Footer;
