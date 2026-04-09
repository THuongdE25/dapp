function Banner() {
  return (
    <div
      id="banner"
      className="carousel slide carousel-fade"
      data-bs-ride="carousel"
      data-bs-interval="3000"
    >
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img
            src="/images/banner1.jpg"
            className="d-block w-100 banner-img"
            alt="banner cake 1"
          />
        </div>

        <div className="carousel-item">
          <img
            src="/images/banner2.jpg"
            className="d-block w-100 banner-img"
            alt="banner cake 2"
          />
        </div>

        <div className="carousel-item">
          <img
            src="/images/banner3.jpg"
            className="d-block w-100 banner-img"
            alt="banner cake 3"
          />
        </div>
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#banner"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#banner"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default Banner;