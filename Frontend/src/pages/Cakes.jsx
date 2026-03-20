import { useParams, Link } from "react-router-dom";
import ProductCatalog from "../data/ProductsCatalog";

function Cakes() {
  const { category } = useParams();
  const filteredProducts = ProductCatalog.filter((item) =>
    item.slug.startsWith(category),
  );
  return (
    <>
      <div className="container mt-4">
        <h2 className="mb-4 text-capitalize text-center">{category} Cake</h2>
        <div className="row">
          {filteredProducts.map((cakes) => (
            <div className="col-md-3 mb-4" key={cakes.id}>
              <div className="card h-100 shadow-sm product-card">
                <img
                  src={cakes.img}
                  className="card-img-top"
                  alt={cakes.name}
                />
                <div className="card-body text-center">
                  <h6 className="fw-bold">{cakes.name}</h6>
                  <p className="price">
                    {cakes.price.toLocaleString("vi-VN")} đ
                  </p>
                  <Link to={`/product/${cakes.slug}`} className="btn-cart">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Cakes;
