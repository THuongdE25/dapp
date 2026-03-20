import { Navigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import ProductCatalog from "../data/ProductsCatalog";
import { useNavigate } from "react-router-dom";

function ProductDetail() {
  const { slug } = useParams();

  const product = ProductCatalog.find((item) => item.slug === slug);
  const [size, setSize] = useState("19cm");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  if (!product) return <h2>Không tìm thấy sản phẩm</h2>;

  return (
    <div className="container mt-5">
      <div className="product-box p-4">
        <div className="row">
          <div className="col-md-6">
            <img
              src={product.img}
              className="img-fluid product-img"
              alt={product.name}
            />
          </div>
          <div className="col-md-6 product-info">
            <h2 className="fw-bold">{product.name}</h2>
            <h4 className="price">{product.price.toLocaleString("vi-VN")} đ</h4>
            <div className="mt-4">
              <h5>Kích thước</h5>
              <button className="me-2 size" onClick={() => setSize("19cm")}>
                19 cm
              </button>
            </div>
            <div className="mt-4">
              <h5>Số lượng</h5>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-dark"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  -
                </button>
                <span className="mx-3">{quantity}</span>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-4">
              <button
                className="btn-cart me-3"
                onClick={() => addToCart({ ...product })}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="btn-cart"
                onClick={() => {
                  navigate("/checkout", {
                    state: {
                      buyNowItem: {
                        ...product,
                        quantity,
                        size,
                      },
                    },
                  });
                }}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
