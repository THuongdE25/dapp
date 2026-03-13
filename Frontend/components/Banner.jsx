function Banner() {
  return (
    <>
      <div
        id="banner"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
        data-bs-interval="3000"
      >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src="/src/assets/banner1.jpg"
              className="banner-img"
              alt="banner cake"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/src/assets/banner2.jpg"
              className="banner-img"
              alt="banner cake"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/src/assets/banner3.jpg"
              className="banner-img"
              alt="banner cake"
            />
          </div>
        </div>
      </div>
    </>
  );
}
export default Banner;
