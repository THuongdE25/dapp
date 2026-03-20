function ProductMax({ cake }) {
  return (
    <>
      <div className="col-md-3 mb-4">
        <div className="card product-card">
          <span className="badge sale-badge color">Bán chạy</span>
          <div className="img-wrapper">
            <img
              src={cake.img}
              className="card-img-top product-img"
              alt="cake"
            />
            <button className="cart-btn">🛒</button>
          </div>
          <div className="card-body text-center">
            <h6 className="fw-bold">{cake.name}</h6>
            <p className="price">{cake.price.toLocaleString("vi-VN")} đ</p>
          </div>
        </div>
      </div>
    </>
  );
}
export default ProductMax;
