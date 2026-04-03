import { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getContractWithSigner } from "../contract/contract";
import { ethers } from "ethers";

function CheckOut() {
  const { cart, setCart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const buyNowItem = location.state?.buyNowItem;

  const [loading, setLoading] = useState(false);

  //  Lấy item cần thanh toán
  const items = buyNowItem
    ? [buyNowItem]
    : cart.filter((item) => item.checked);

  // Tổng tiền
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  //  HANDLE CHECKOUT
  const handleSubmit = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài MetaMask!");
      return;
    }

    if (items.length === 0) {
      alert("Chưa có sản phẩm");
      return;
    }

    try {
      setLoading(true);

      const contract = await getContractWithSigner();

      //  Nếu contract chỉ support 1 item / lần
      for (const item of items) {
        const value = ethers.parseEther(
          (item.price * item.quantity).toFixed(6)
        );

        const tx = await contract.orderCake(
          item.id,
          item.quantity,
          { value }
        );

        await tx.wait(); //  BẮT BUỘC
      }

      alert(" Đặt hàng thành công!");

      //  Xóa cart đã mua
      if (!buyNowItem) {
        const remaining = cart.filter((item) => !item.checked);
        setCart(remaining);
      }

      //  Redirect sang orders
      navigate("/orders", { state: { refresh: Date.now() } });

    } catch (err) {
      console.error("Checkout error:", err);
      alert("❌ Lỗi khi đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  //  Loading
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h3> Đang xử lý giao dịch...</h3>
      </div>
    );
  }

  //  Không có sản phẩm
  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4>Chưa có sản phẩm để thanh toán</h4>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">💳 Thanh toán (Web3)</h2>

      <div className="row">
        {/* LEFT */}
        <div className="col-md-6">
          <button
            className="btn btn-success w-100"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Đang xử lý..."
              : "Thanh toán bằng MetaMask"}
          </button>
        </div>

        {/* RIGHT */}
        <div className="col-md-6">
          <h5>📦 Đơn hàng của bạn</h5>

          {items.map((item) => (
            <div
              className="d-flex justify-content-between mb-2"
              key={item.id}
            >
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>
                {(item.price * item.quantity).toFixed(3)} ROSE
              </span>
            </div>
          ))}

          <hr />

          <h5 className="fw-bold">
            Tổng: {total.toFixed(3)} ROSE
          </h5>
        </div>
      </div>
    </div>
  );
}

export default CheckOut;