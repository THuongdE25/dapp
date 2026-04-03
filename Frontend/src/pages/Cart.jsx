import { useContext, useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import { getContractWithSigner } from "../contract/contract";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, setCart, removeFromCart, increaseQty, decreaseQty, toggleCheck } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // hiển thị trạng thái transaction
  const navigate = useNavigate();

  // Lọc các item được check
  const selectedItems = cart.filter((item) => item.checked);

  // Tổng ROSE của các item được chọn
  const totalEth = selectedItems.reduce((sum, item) => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    return sum + itemTotal;
  }, 0);

  // Checkout
  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn sản phẩm để thanh toán");
      return;
    }

    try {
      setLoading(true);
      setTxStatus("Đang xử lý giao dịch...");

      const contract = await getContractWithSigner();

      for (const item of selectedItems) {
        const total = Number(item.price) * Number(item.quantity);
        const value = ethers.parseUnits(total.toString(), 18); // 18 decimals

        const tx = await contract.orderCake(item.id, item.quantity, { value });
        setTxStatus(`Đang chờ xác nhận cho ${item.name}...`);
        await tx.wait(); // đợi transaction mined
      }

      setTxStatus("Thanh toán thành công 🎉");

      // Xóa các item đã thanh toán khỏi cart
      const remaining = cart.filter((item) => !item.checked);
      setCart(remaining);

      // Redirect sang OrderHistory để user thấy đơn mới
      navigate("/orders", { state: { refresh: true } });

    } catch (err) {
      console.error(err);
      alert("Thanh toán thất bại. Kiểm tra MetaMask và số dư.");
    } finally {
      setLoading(false);
      setTxStatus(null);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Giỏ hàng</h2>

      {cart.length === 0 && <p>Giỏ hàng trống</p>}

      {cart.map((item) => (
        <div key={item.id} className="row border p-2 mb-3 align-items-center">
          <div className="col-md-1">
            <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} />
          </div>

          <div className="col-md-2">
            <img src={item.img} width="80" alt={item.name} style={{ borderRadius: "8px" }} />
          </div>

          <div className="col-md-3">
            <h5>{item.name}</h5>
          </div>

          <div className="col-md-2">
            {item.price} ROSE
          </div>

          <div className="col-md-2">
            <button className="btn btn-sm btn-secondary" onClick={() => decreaseQty(item.id)}>-</button>
            <span className="mx-2">{item.quantity}</span>
            <button className="btn btn-sm btn-secondary" onClick={() => increaseQty(item.id)}>+</button>
          </div>

          <div className="col-md-2">
            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>Xóa</button>
          </div>
        </div>
      ))}

      {selectedItems.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <h4>Tổng: {totalEth.toFixed(4)} ROSE</h4>
          <button
            className="btn btn-success"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? txStatus || "Đang xử lý..." : "Thanh toán (MetaMask)"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;