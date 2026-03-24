import { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { getContractWithSigner } from "../contract/contract";
import { ethers } from "ethers";

function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    toggleCheck,
  } = useContext(CartContext);

  const [loading, setLoading] = useState(false);

  const selectedItems = cart.filter((item) => item.checked);

  const totalEth = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const contract = await getContractWithSigner();

      for (let item of selectedItems) {
        const value =
          ethers.parseEther(item.price.toString()) *
          BigInt(item.quantity);

        const tx = await contract.orderCake(item.id, item.quantity, {
          value,
        });

        await tx.wait();
      }

      alert("Thanh toán thành công ");
    } catch (err) {
      console.error(err);
      alert("Thanh toán thất bại ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Giỏ hàng</h2>

      {cart.length === 0 && <p>Giỏ hàng trống</p>}

      {cart.map((item) => (
        <div key={item.id} className="row border p-2 mb-3">
          <div className="col-md-1">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleCheck(item.id)}
            />
          </div>

          <div className="col-md-2">
            <img src={item.img} width="80" alt="" />
          </div>

          <div className="col-md-3">
            <h5>{item.name}</h5>
          </div>

          <div className="col-md-2">
            {item.price} ROSE
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => decreaseQty(item.id)}
            >
              -
            </button>

            <span className="mx-2">{item.quantity}</span>

            <button
              className="btn btn-sm btn-secondary"
              onClick={() => increaseQty(item.id)}
            >
              +
            </button>
          </div>

          <div className="col-md-2">
            <button
              className="btn-cart"
              onClick={() => removeFromCart(item.id)}
            >
              Xoá
            </button>
          </div>
        </div>
      ))}

      <h4 className="price">
        Tổng: {totalEth.toFixed(4)} ROSE
      </h4>

      {totalEth > 0 && (
        <button
          className="btn-cart"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Thanh toán (MetaMask)"}
        </button>
      )}
    </div>
  );
}

export default Cart;