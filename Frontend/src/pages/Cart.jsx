// import { useContext, useState } from "react";
// import { CartContext } from "./CartContext";
// import { getContractWithSigner } from "../contract/contract";
// import { ethers } from "ethers";
// import { useNavigate } from "react-router-dom";

// function Cart() {
//   const { cart, setCart, removeFromCart, increaseQty, decreaseQty, toggleCheck } = useContext(CartContext);
//   const [loading, setLoading] = useState(false);
//   const [txStatus, setTxStatus] = useState(null);
//   const navigate = useNavigate();

//   const selectedItems = cart.filter((item) => item.checked);

//   const totalEth = selectedItems.reduce((sum, item) => {
//     const itemTotal = Number(item.price) * Number(item.quantity);
//     return sum + itemTotal;
//   }, 0);

//   const handleCheckout = async () => {
//     if (selectedItems.length === 0) {
//       alert("Vui long chon san pham de thanh toan");
//       return;
//     }

//     try {
//       setLoading(true);
//       setTxStatus("Dang xu ly giao dich...");

//       const contract = await getContractWithSigner();

//       for (const item of selectedItems) {
//         const blockchainId = Number(item.blockchain_id ?? item.id);
//         const unitPrice = Number(item.blockchain_price ?? item.price);

//         if (!Number.isInteger(blockchainId) || blockchainId <= 0) {
//           throw new Error(`San pham ${item.name} chua co blockchain_id`);
//         }

//         if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
//           throw new Error(`San pham ${item.name} chua co blockchain_price hop le`);
//         }

//         const total = (unitPrice * Number(item.quantity)).toFixed(6);
//         const value = ethers.parseEther(total);

//         const tx = await contract.orderCake(blockchainId, item.quantity, { value });
//         setTxStatus(`Dang cho xac nhan cho ${item.name}...`);
//         await tx.wait();
//       }

//       setTxStatus("Thanh toan thanh cong");

//       const remaining = cart.filter((item) => !item.checked);
//       setCart(remaining);

//       navigate("/orders", { state: { refresh: true } });
//     } catch (err) {
//       console.error(err);
//       alert("Thanh toan that bai. San pham co the chua sync blockchain hoac sai gia on-chain.");
//     } finally {
//       setLoading(false);
//       setTxStatus(null);
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2>Gio hang</h2>

//       {cart.length === 0 && <p>Gio hang trong</p>}

//       {cart.map((item) => (
//         <div key={item.id} className="row border p-2 mb-3 align-items-center">
//           <div className="col-md-1">
//             <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} />
//           </div>

//           <div className="col-md-2">
//             <img src={item.img} width="80" alt={item.name} style={{ borderRadius: "8px" }} />
//           </div>

//           <div className="col-md-3">
//             <h5>{item.name}</h5>
//           </div>

//           <div className="col-md-2">{item.price} ROSE</div>
//           <p className="sold-text">{item.total_sold || 0} đã bán</p>

//           <div className="col-md-2">
//             <button className="btn btn-sm btn-secondary" onClick={() => decreaseQty(item.id)}>
//               -
//             </button>
//             <span className="mx-2">{item.quantity}</span>
//             <button className="btn btn-sm btn-secondary" onClick={() => increaseQty(item.id)}>
//               +
//             </button>
//           </div>

//           <div className="col-md-2">
//             <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>
//               Xoa
//             </button>
//           </div>
//         </div>
//       ))}

//       {selectedItems.length > 0 && (
//         <div className="d-flex justify-content-between align-items-center mt-4">
//           <h4>Tong: {totalEth.toFixed(4)} ROSE</h4>
//           <button className="btn btn-success" onClick={handleCheckout} disabled={loading}>
//             {loading ? txStatus || "Dang xu ly..." : "Thanh toan (MetaMask)"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Cart;
import { useContext, useEffect, useState } from "react";
import { CartContext } from "./CartContext";
import { getContractWithSigner } from "../contract/contract";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, setCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const navigate = useNavigate();

  const loadCartFromDb = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts[0];

      const res = await fetch(`http://localhost:3000/api/cart?wallet=${walletAddress}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Khong tai duoc gio hang");
      }

      const formatted = data.map((item) => ({
        id: item.id,
        cake_id: item.cake_id,
        blockchain_id: item.blockchain_id ?? item.cake_id,
        blockchain_price: Number(item.blockchain_price ?? item.price ?? 0),
        name: item.name,
        img: item.image_url,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        size: item.size,
        checked: true,
        total_sold: item.total_sold || 0,
      }));

      setCart(formatted);
    } catch (err) {
      console.error("Loi load cart:", err);
      setCart([]);
    }
  };

  useEffect(() => {
    loadCartFromDb();
  }, []);

  const selectedItems = cart.filter((item) => item.checked);

  const totalEth = selectedItems.reduce((sum, item) => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    return sum + itemTotal;
  }, 0);

  const toggleCheck = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const increaseQty = async (id) => {
    try {
      const target = cart.find((item) => item.id === id);
      if (!target) return;

      const newQty = Number(target.quantity) + 1;

      const res = await fetch(`http://localhost:3000/api/cart/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Cap nhat so luong that bai");
      }

      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );
    } catch (err) {
      console.error("Loi increaseQty:", err);
      alert(err.message || "Loi cap nhat so luong");
    }
  };

  const decreaseQty = async (id) => {
    try {
      const target = cart.find((item) => item.id === id);
      if (!target) return;

      const newQty = Number(target.quantity) - 1;
      if (newQty <= 0) return;

      const res = await fetch(`http://localhost:3000/api/cart/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Cap nhat so luong that bai");
      }

      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );
    } catch (err) {
      console.error("Loi decreaseQty:", err);
      alert(err.message || "Loi cap nhat so luong");
    }
  };

  const removeFromCart = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/cart/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Xoa khoi gio that bai");
      }

      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Loi removeFromCart:", err);
      alert(err.message || "Loi xoa san pham");
    }
  };

  const extractBlockchainOrderIndex = (receipt, contract) => {
    let blockchain_order_index = null;

    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);

        if (parsedLog && parsedLog.name === "CakeOrdered") {
          blockchain_order_index = Number(parsedLog.args.orderIndex);
          break;
        }
      } catch (_) {}
    }

    return blockchain_order_index;
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert("Vui long chon san pham de thanh toan");
      return;
    }

    try {
      setLoading(true);
      setTxStatus("Dang xu ly giao dich...");

      if (!window.ethereum) {
        alert("Vui long cai MetaMask");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts[0];
      const contract = await getContractWithSigner();

      for (const item of selectedItems) {
        const blockchainId = Number(item.blockchain_id);
        const sqlCakeId = Number(item.cake_id);

        if (!Number.isInteger(blockchainId) || blockchainId <= 0) {
          throw new Error(`San pham ${item.name} chua co blockchain_id hop le`);
        }

        const chainCake = await contract.getCake(blockchainId);

        if (!chainCake.isAvailable) {
          throw new Error(`San pham ${item.name} dang tam het hang tren blockchain`);
        }

        const value = chainCake.price * BigInt(Number(item.quantity));

        setTxStatus(`Dang thanh toan cho ${item.name}...`);
        const tx = await contract.orderCake(blockchainId, item.quantity, { value });
        const receipt = await tx.wait();

        const blockchain_order_index = extractBlockchainOrderIndex(receipt, contract);

        if (blockchain_order_index == null) {
          throw new Error(`Khong lay duoc blockchain_order_index cho ${item.name}`);
        }

        const orderRes = await fetch("http://localhost:3000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
            total_price: Number(item.price) * Number(item.quantity),
            transaction_hash: receipt.hash,
            blockchain_order_index,
            shipping_name: null,
            shipping_phone: null,
            shipping_address: null,
            note: item.size ? `Size: ${item.size}` : null,
            items: [
              {
                cake_id: sqlCakeId,
                quantity: Number(item.quantity),
                price: Number(item.price),
              },
            ],
          }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok) {
          throw new Error(orderData.message || `Luu don hang that bai cho ${item.name}`);
        }

        const deleteRes = await fetch(`http://localhost:3000/api/cart/${item.id}`, {
          method: "DELETE",
        });

        const deleteData = await deleteRes.json();

        if (!deleteRes.ok) {
          throw new Error(deleteData.message || `Xoa item khoi gio that bai cho ${item.name}`);
        }
      }

      await loadCartFromDb();

      setTxStatus("Thanh toan thanh cong");
      alert("Thanh toan thanh cong");
      navigate("/orders", { state: { refresh: true } });
    } catch (err) {
      console.error("Loi thanh toan cart:", err);
      const raw = `${err?.shortMessage || ""} ${err?.reason || ""} ${err?.message || ""}`.toLowerCase();
      let message = err?.message || "Thanh toan that bai";

      if (raw.includes("not enough value")) {
        message = "So tien gui len blockchain khong du";
      } else if (raw.includes("action_rejected") || raw.includes("user rejected")) {
        message = "Ban da tu choi giao dich trong MetaMask";
      }

      alert(message);
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