import { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { getContractWithSigner } from "../contract/contract";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, setCart, removeFromCart, increaseQty, decreaseQty, toggleCheck } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const navigate = useNavigate();

  const selectedItems = cart.filter((item) => item.checked);

  const totalEth = selectedItems.reduce((sum, item) => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    return sum + itemTotal;
  }, 0);

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert("Vui long chon san pham de thanh toan");
      return;
    }

    try {
      setLoading(true);
      setTxStatus("Dang xu ly giao dich...");

      const contract = await getContractWithSigner();

      for (const item of selectedItems) {
        const blockchainId = Number(item.blockchain_id ?? item.id);
        const unitPrice = Number(item.blockchain_price ?? item.price);

        if (!Number.isInteger(blockchainId) || blockchainId <= 0) {
          throw new Error(`San pham ${item.name} chua co blockchain_id`);
        }

        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          throw new Error(`San pham ${item.name} chua co blockchain_price hop le`);
        }

        const total = (unitPrice * Number(item.quantity)).toFixed(6);
        const value = ethers.parseEther(total);

        const tx = await contract.orderCake(blockchainId, item.quantity, { value });
        setTxStatus(`Dang cho xac nhan cho ${item.name}...`);
        await tx.wait();
      }

      setTxStatus("Thanh toan thanh cong");

      const remaining = cart.filter((item) => !item.checked);
      setCart(remaining);

      navigate("/orders", { state: { refresh: true } });
    } catch (err) {
      console.error(err);
      alert("Thanh toan that bai. San pham co the chua sync blockchain hoac sai gia on-chain.");
    } finally {
      setLoading(false);
      setTxStatus(null);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Gio hang</h2>

      {cart.length === 0 && <p>Gio hang trong</p>}

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

          <div className="col-md-2">{item.price} ROSE</div>
          <p className="sold-text">{item.total_sold || 0} đã bán</p>

          <div className="col-md-2">
            <button className="btn btn-sm btn-secondary" onClick={() => decreaseQty(item.id)}>
              -
            </button>
            <span className="mx-2">{item.quantity}</span>
            <button className="btn btn-sm btn-secondary" onClick={() => increaseQty(item.id)}>
              +
            </button>
          </div>

          <div className="col-md-2">
            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>
              Xoa
            </button>
          </div>
        </div>
      ))}

      {selectedItems.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <h4>Tong: {totalEth.toFixed(4)} ROSE</h4>
          <button className="btn btn-success" onClick={handleCheckout} disabled={loading}>
            {loading ? txStatus || "Dang xu ly..." : "Thanh toan (MetaMask)"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
