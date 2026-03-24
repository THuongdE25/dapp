import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { CartContext } from "./CartContext";
import ProductCatalog from "../data/ProductsCatalog";
import { getContractReadOnly, getContractWithSigner } from "../contract/contract";
import { ethers } from "ethers";

function ProductDetail() {
  const { slug } = useParams();

  const product = ProductCatalog.find((item) => item.slug === slug);

  const [size, setSize] = useState("19cm");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0); 
  const [isAvailable, setIsAvailable] = useState(true);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const loadBlockchainData = async () => {
      const contract = getContractReadOnly();

      try {
        const onChain = await contract.getCake(product.id);

        setPrice(Number(ethers.formatEther(onChain.price)));
        setIsAvailable(onChain.isAvailable);
      } catch (err) {
        console.error(err);
      }
    };

    if (product) loadBlockchainData();
  }, [product]);

  if (!product) return <h2>Không tìm thấy sản phẩm</h2>;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      img: product.img,
      price: price, 
      quantity: quantity,
      checked: true,
    });
  };

  const handleBuyNow = async () => {
    try {
      const contract = await getContractWithSigner();

      const value =
        ethers.parseEther(price.toString()) * BigInt(quantity);

      const tx = await contract.orderCake(product.id, quantity, {
        value,
      });

      await tx.wait();

      alert("Mua thành công ");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi mua ");
    }
  };

  return (
    <div className="container mt-5">
      <div className="product-box p-4">
        <div className="row">
          <div className="col-md-6">
            <img
              src={product.img}
              className="img-fluid"
              alt={product.name}
            />
          </div>

          <div className="col-md-6">
            <h2>{product.name}</h2>

            <h4>{price} ROSE</h4>

            {!isAvailable && (
              <p style={{ color: "red" }}>Hết hàng</p>
            )}

            <div className="mt-3">
              <h5>Kích thước</h5>
              <button onClick={() => setSize("19cm")}>
                19 cm
              </button>
            </div>

            <div className="mt-3">
              <h5>Số lượng</h5>
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
                -
              </button>
              <span className="mx-2">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>
                +
              </button>
            </div>

            <div className="mt-4">
              <button
                className="btn-cart me-2"
                onClick={handleAddToCart}
                disabled={!isAvailable}
              >
                Thêm vào giỏ
              </button>

              <button
                className="btn-cart"
                onClick={handleBuyNow}
                disabled={!isAvailable}
              >
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