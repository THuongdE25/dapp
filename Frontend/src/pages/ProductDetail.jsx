// import { useParams } from "react-router-dom";
// import { useState, useEffect, useContext } from "react";
// import { CartContext } from "./CartContext";
// import { getContractWithSigner } from "../contract/contract";
// import { ethers } from "ethers";

// function ProductDetail() {
//   const { id } = useParams();

//   const [product, setProduct] = useState(null);
//   const [size, setSize] = useState("19cm");
//   const [quantity, setQuantity] = useState(1);
//   const [loading, setLoading] = useState(true);

//   const { addToCart } = useContext(CartContext);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);

//         const res = await fetch(`http://localhost:3000/api/cakes/${id}`);
//         const data = await res.json();

//         if (!res.ok) {
//           throw new Error(data.message || "Khong tim thay san pham");
//         }

//         setProduct(data);
//       } catch (err) {
//         console.error("Loi fetch product:", err);
//         setProduct(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   const handleAddToCart = () => {
//     if (!product) return;

//     addToCart({
//       id: product.id,
//       blockchain_id: product.blockchain_id,
//       blockchain_price: Number(product.blockchain_price) || Number(product.price) || 0,
//       name: product.name,
//       img: product.image_url || product.img,
//       price: Number(product.price) || 0,
//       quantity,
//       checked: true,
//     });
//   };

//   const handleBuyNow = async () => {
//     try {
//       if (!product) return;

//       const blockchainId = Number(product.blockchain_id);

//       if (!Number.isInteger(blockchainId) || blockchainId <= 0) {
//         alert("San pham nay chua duoc dong bo len blockchain");
//         return;
//       }

//       const contract = await getContractWithSigner();

//       const unitPrice = Number(product.blockchain_price);
//       if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
//         alert("Thieu gia blockchain cua san pham");
//         return;
//       }

//       const total = (unitPrice * quantity).toFixed(6);
//       const value = ethers.parseEther(total);

//       const tx = await contract.orderCake(blockchainId, quantity, { value });
//       await tx.wait();

//       alert("Mua thanh cong");
//     } catch (err) {
//       console.error("Loi khi mua:", err);
//       alert("Loi khi mua bang MetaMask");
//     }
//   };

//   if (loading) return <h2>Dang tai san pham...</h2>;
//   if (!product) return <h2>Khong tim thay san pham</h2>;

//   return (
//     <div className="container mt-5">
//       <div className="product-box p-4">
//         <div className="row">
//           <div className="col-md-6">
//             <img
//               src={product.image_url || product.img}
//               className="img-fluid"
//               alt={product.name}
//               style={{
//                 width: "100%",
//                 maxHeight: "450px",
//                 objectFit: "cover",
//                 borderRadius: "12px",
//               }}
//             />
//           </div>

//           <div className="col-md-6">
//             <h2>{product.name}</h2>
//             <h4>{Number(product.price) || 0} ROSE</h4>

//             <div className="mt-3">
//               <h5>Kich thuoc</h5>
//               <button onClick={() => setSize("19cm")}>19 cm</button>
//             </div>

//             <div className="mt-3">
//               <h5>So luong</h5>
//               <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
//                 -
//               </button>
//               <span className="mx-2">{quantity}</span>
//               <button onClick={() => setQuantity(quantity + 1)}>+</button>
//             </div>

//             <div className="mt-4">
//               <button className="btn-cart me-2" onClick={handleAddToCart}>
//                 Them vao gio
//               </button>

//               <button className="btn-cart" onClick={handleBuyNow}>
//                 Mua ngay (MetaMask)
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProductDetail;

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
          throw new Error(data.message || "Khong tim thay san pham");
        }

        setProduct(data);
      } catch (err) {
        console.error("Loi fetch product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      if (!product) return;

      if (!window.ethereum) {
        alert("Vui lòng cài MetaMask");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts[0];

      const res = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          cake_id: product.id,
          quantity,
          size,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Thêm vào giỏ thất bại");
      }

      alert("Đã thêm vào giỏ hàng");
    } catch (err) {
      console.error("Lỗi addToCart:", err);
      alert(err.message || "Lỗi thêm vào giỏ");
    }
  };

  const handleBuyNow = async () => {
    try {
      if (!product) return;

      const blockchainId = Number(product.blockchain_id);
      const sqlCakeId = Number(product.id);

      console.log("Cake blockchain_id:", blockchainId);

      if (!Number.isInteger(blockchainId) || blockchainId <= 0) {
        alert("Sản phẩm này chưa được đồng bộ lên blockchain");
        return;
      }

      if (!Number.isInteger(sqlCakeId) || sqlCakeId <= 0) {
        alert("Không tìm thấy cake id trong SQL");
        return;
      }

      if (!window.ethereum) {
        alert("Vui lòng cài MetaMask");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];

      const contract = await getContractWithSigner();

      const chainCake = await contract.getCake(blockchainId);

      if (!chainCake || Number(chainCake.id) <= 0) {
        throw new Error("Cake này chưa có trên blockchain");
      }

      if (!chainCake.isAvailable) {
        throw new Error("Cake này đang tạm hết hàng trên blockchain");
      }

      const value = chainCake.price * BigInt(quantity);

      const tx = await contract.orderCake(blockchainId, quantity, { value });
      const receipt = await tx.wait();

      let blockchain_order_index = null;

      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === "CakeOrdered") {
            blockchain_order_index = Number(parsed.args.orderIndex);
            break;
          }
        } catch (_) { }
      }

      if (blockchain_order_index == null) {
        throw new Error("Không lấy được blockchain_order_index từ event CakeOrdered");
      }

      const orderRes = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          total_price: Number(product.price) * quantity,
          transaction_hash: receipt.hash,
          blockchain_order_index,
          shipping_name: null,
          shipping_phone: null,
          shipping_address: null,
          note: `Size: ${size}`,
          items: [
            {
              cake_id: sqlCakeId,
              quantity,
              price: Number(product.price)
            }
          ]
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.message || "Lưu đơn hàng thất bại");
      }

      alert("Mua thành công");
      console.log("Đã lưu đơn hàng vào SQL:", orderData);
    } catch (err) {
      console.error("Lỗi khi mua:", err);

      const raw =
        `${err?.shortMessage || ""} ${err?.reason || ""} ${err?.message || ""}`.toLowerCase();

      let message = err?.message || "Lỗi khi mua bằng MetaMask";

      if (raw.includes("cake not found")) {
        message = "Cake này chưa có trên blockchain. Vui lòng báo admin sync lại.";
      } else if (raw.includes("cake not available")) {
        message = "Cake này đang tạm hết hàng trên blockchain";
      } else if (raw.includes("not enough value")) {
        message = "Số tiền gửi lên blockchain không đủ, vui lòng thử lại.";
      } else if (ethers.isError(err, "ACTION_REJECTED")) {
        message = "Bạn đã từ chối giao dịch trong MetaMask.";
      }

      alert(message);
    }
  };

  if (loading) return <h2>Dang tai san pham...</h2>;
  if (!product) return <h2>Khong tim thay san pham</h2>;

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
              <h5>Kich thuoc</h5>
              <button onClick={() => setSize("19cm")}>19 cm</button>
            </div>

            <div className="mt-3">
              <h5>So luong</h5>
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
