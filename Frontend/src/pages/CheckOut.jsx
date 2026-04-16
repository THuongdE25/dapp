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

  const items = buyNowItem ? [buyNowItem] : cart.filter((item) => item.checked);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    if (!window.ethereum) {
      alert("Vui long cai MetaMask");
      return;
    }

    if (items.length === 0) {
      alert("Chua co san pham");
      return;
    }

    try {
      setLoading(true);

      const contract = await getContractWithSigner();

      for (const item of items) {
        const blockchainId = Number(item.blockchain_id ?? item.id);
        const unitPrice = Number(item.blockchain_price ?? item.price);

        if (!Number.isInteger(blockchainId) || blockchainId <= 0) {
          throw new Error(`San pham ${item.name} chua co blockchain_id`);
        }

        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          throw new Error(`San pham ${item.name} chua co blockchain_price hop le`);
        }

        const value = ethers.parseEther((unitPrice * item.quantity).toFixed(6));

        const tx = await contract.orderCake(blockchainId, item.quantity, { value });
        await tx.wait();
      }

      alert("Dat hang thanh cong");

      if (!buyNowItem) {
        const remaining = cart.filter((item) => !item.checked);
        setCart(remaining);
      }

      navigate("/orders", { state: { refresh: Date.now() } });
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Loi khi dat hang. San pham co the chua sync blockchain.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h3>Dang xu ly giao dich...</h3>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4>Chua co san pham de thanh toan</h4>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Thanh toan (Web3)</h2>

      <div className="row">
        <div className="col-md-6">
          <button className="btn btn-success w-100" onClick={handleSubmit} disabled={loading}>
            {loading ? "Dang xu ly..." : "Thanh toan bang MetaMask"}
          </button>
        </div>

        <div className="col-md-6">
          <h5>Don hang cua ban</h5>

          {items.map((item) => (
            <div className="d-flex justify-content-between mb-2" key={item.id}>
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>{(item.price * item.quantity).toFixed(3)} ROSE</span>
            </div>
          ))}

          <hr />

          <h5 className="fw-bold">Tong: {total.toFixed(3)} ROSE</h5>
        </div>
      </div>
    </div>
  );
}

export default CheckOut;
