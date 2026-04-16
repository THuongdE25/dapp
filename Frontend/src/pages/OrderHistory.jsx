// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { getContractWithSigner } from "../contract/contract";
// import ProductCatalog from "../data/ProductsCatalog";
// import { ethers } from "ethers";

// function OrderHistory({ account }) {
//   const location = useLocation();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const loadOrders = async () => {
//     if (!account) {
//       setOrders([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       const contract = await getContractWithSigner();
//       const data = await contract.getMyOrders();

//       const formatted = data.map((o, i) => {
//         const product = ProductCatalog.find(p => p.id === Number(o.cakeId));
//         return {
//           id: i,
//           cakeId: Number(o.cakeId),
//           name: product?.name || "Unknown Cake",
//           img: product?.img || "",
//           quantity: Number(o.quantity),
//           total: parseFloat(ethers.formatEther(o.totalPrice)),
//           timestamp: Number(o.timestamp),
//           delivered: o.delivered,
//         };
//       });

//       setOrders(formatted);
//     } catch (err) {
//       console.error(err);
//       setOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Load orders lần đầu & lắng nghe event realtime
// useEffect(() => {
//   if (!account) return;

//   loadOrders();

//   const handler = () => loadOrders();
//   window.addEventListener("orderUpdated", handler);

//   return () => {
//     window.removeEventListener("orderUpdated", handler);
//   };
// }, [account, location.state?.refresh]);


//   if (!account) return <h4 className="text-center mt-5">Vui lòng kết nối ví</h4>;
//   if (loading) return <h3 className="text-center mt-5">Loading...</h3>;
//   if (orders.length === 0) return <h4 className="text-center mt-5">Chưa có đơn hàng nào</h4>;

//   return (
//     <div className="container py-5">
//       <h2 className="mb-4">📦 Lịch sử đơn hàng</h2>
//       {orders.map(o => (
//         <div key={o.id} className="card1 mb-4 shadow-sm">
//           <div className="card1-body">
//             <div className="d-flex justify-content-between mb-3">
//               <h5 className="fw-bold m-0">🍰 Cake Shop</h5>
//               <span className={`badge ${o.delivered ? "bg-success" : "bg-warning text-dark"}`}>
//                 {o.delivered ? "Đã giao" : "Đang xử lý"}
//               </span>
//             </div>
//             <hr />
//             <div className="d-flex align-items-center mb-3">
//               <img src={o.img} alt={o.name} style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }} />
//               <div className="ms-3 flex-grow-1">
//                 <h6 className="mb-2">{o.name}</h6>
//                 <small className="text-muted">Số lượng: {o.quantity}</small>
//               </div>
//               <div className="fw-bold price">{o.total.toFixed(3)} ROSE</div>
//             </div>
//             <hr />
//             <div className="d-flex justify-content-between align-items-center">
//               <h5 className="price fw-bold m-0">Tổng: {o.total.toFixed(3)} ROSE</h5>
//               <small className="text-muted">{new Date(o.timestamp * 1000).toLocaleString()}</small>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default OrderHistory;


import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function OrderHistory({ account }) {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);

  const loadOrders = async () => {
    if (!account) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:3000/api/orders/my-orders?wallet=${account}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Không tải được đơn hàng");
      }

      const formatted = data.map((o, i) => ({
        id: `${o.order_id}-${o.cake_id}-${i}`,
        order_id: o.order_id,
        cakeId: Number(o.cake_id),
        name: o.name || "Unknown Cake",
        img: o.image_url || o.img || "",
        quantity: Number(o.quantity),
        total: Number(o.total_price || 0),
        timestamp: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
        shipping_status: o.shipping_status || "pending",
      }));

      setOrders(formatted);
    } catch (err) {
      console.error("Lỗi load orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!account) {
      setOrders([]);
      setLoading(false);
      return;
    }

    loadOrders();

    const handler = () => loadOrders();
    window.addEventListener("orderUpdated", handler);

    return () => {
      window.removeEventListener("orderUpdated", handler);
    };
  }, [account, location.state?.refresh]);

  const renderShippingStatus = (shipping_status) => {
    switch (shipping_status) {
      case "pending":
        return "Chờ xử lý";
      case "shipping":
        return "Đang giao hàng";
      case "delivered":
        return "Đã nhận hàng";
      default:
        return "Không xác định";
    }
  };

  const getShippingBadgeClass = (shipping_status) => {
    switch (shipping_status) {
      case "pending":
        return "bg-warning text-dark";
      case "shipping":
        return "bg-info text-dark";
      case "delivered":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  const handleReceivedOrder = async (orderId) => {
    try {
      setConfirmingOrderId(orderId);

      const res = await fetch(`http://localhost:3000/api/orders/${orderId}/shipping-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shipping_status: "delivered" }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Cập nhật thất bại");
        return;
      }

      alert("Cảm ơn bạn đã xác nhận đã nhận được hàng");

      setOrders((prev) =>
        prev.map((item) =>
          item.order_id === orderId
            ? {
                ...item,
                shipping_status: "delivered",
              }
            : item
        )
      );
    } catch (err) {
      console.error("handleReceivedOrder error:", err);
      alert(err?.message || "Xác nhận nhận hàng thất bại");
    } finally {
      setConfirmingOrderId(null);
    }
  };

  if (!account) return <h4 className="text-center mt-5">Vui lòng kết nối ví</h4>;
  if (loading) return <h3 className="text-center mt-5">Loading...</h3>;
  if (orders.length === 0) return <h4 className="text-center mt-5">Chưa có đơn hàng nào</h4>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">📦 Lịch sử đơn hàng</h2>
      {orders.map((o) => (
        <div key={o.id} className="card1 mb-4 shadow-sm">
          <div className="card1-body">
            <div className="d-flex justify-content-between mb-3">
              <h5 className="fw-bold m-0">🍰 Cake Shop</h5>
              <span className={`badge ${getShippingBadgeClass(o.shipping_status)}`}>
                {renderShippingStatus(o.shipping_status)}
              </span>
            </div>

            <hr />

            <div className="d-flex align-items-center mb-3">
              <img
                src={o.img}
                alt={o.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <div className="ms-3 flex-grow-1">
                <h6 className="mb-2">{o.name}</h6>
                <small className="text-muted">Số lượng: {o.quantity}</small>
              </div>
              <div className="fw-bold price">{o.total.toFixed(3)} ROSE</div>
            </div>

            <hr />

            <div className="d-flex justify-content-between align-items-center">
              <h5 className="price fw-bold m-0">Tổng: {o.total.toFixed(3)} ROSE</h5>
              <small className="text-muted">
                {new Date(o.timestamp).toLocaleString()}
              </small>
            </div>

            {o.shipping_status === "shipping" && (
              <div className="mt-3">
                <button
                  className="btn btn-success"
                  disabled={confirmingOrderId === o.order_id}
                  onClick={() => handleReceivedOrder(o.order_id)}
                >
                  {confirmingOrderId === o.order_id
                    ? "Đang xác nhận..."
                    : "Đã nhận được hàng"}
                </button>
              </div>
            )}

            {o.shipping_status === "delivered" && (
              <p className="text-success mt-3 mb-0">
                Bạn đã xác nhận nhận hàng
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderHistory;