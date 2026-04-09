import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { CartContext } from "./CartContext";
import { getContractWithSigner } from "../contract/contract";
import { ethers } from "ethers";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("19cm");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await fetch(`http://localhost:3000/api/cakes/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Không tìm thấy sản phẩm");
        }

        setProduct(data);
      } catch (err) {
        console.error("Lỗi fetch product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      img: product.image_url || product.img,
      price: Number(product.price) || 0,
      quantity,
      checked: true,
    });
  };

  const handleBuyNow = async () => {
    try {
      if (!product) return;

      const blockchainId = product.blockchain_id;

      if (!blockchainId) {
        alert("Sản phẩm này chưa được đồng bộ lên blockchain");
        return;
      }

      const contract = await getContractWithSigner();

      const unitPrice = Number(product.blockchain_price);
      if (!unitPrice || unitPrice <= 0) {
        alert("Thiếu giá blockchain của sản phẩm");
        return;
      }

      const total = unitPrice * quantity;
      const value = ethers.parseEther(total.toString());

      const tx = await contract.orderCake(blockchainId, quantity, { value });
      await tx.wait();

      alert("Mua thành công");
    } catch (err) {
      console.error("Lỗi khi mua:", err);
      alert("Lỗi khi mua bằng MetaMask");
    }
  };

  if (loading) return <h2>Đang tải sản phẩm...</h2>;
  if (!product) return <h2>Không tìm thấy sản phẩm</h2>;

  return (
    <div className="container mt-5">
      <div className="product-box p-4">
        <div className="row">
          <div className="col-md-6">
            <img
              src={product.image_url || product.img}
              className="img-fluid"
              alt={product.name}
              style={{
                width: "100%",
                maxHeight: "450px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
          </div>

          <div className="col-md-6">
            <h2>{product.name}</h2>
            <h4>{Number(product.price) || 0} ROSE</h4>

            <div className="mt-3">
              <h5>Kích thước</h5>
              <button onClick={() => setSize("19cm")}>19 cm</button>
            </div>

            <div className="mt-3">
              <h5>Số lượng</h5>
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
                -
              </button>
              <span className="mx-2">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>

            <div className="mt-4">
              <button className="btn-cart me-2" onClick={handleAddToCart}>
                Thêm vào giỏ
              </button>

              <button className="btn-cart" onClick={handleBuyNow}>
                Mua ngay (MetaMask)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;