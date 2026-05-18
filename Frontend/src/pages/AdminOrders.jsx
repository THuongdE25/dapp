import { useEffect, useState } from "react"
import { getContractWithSigner } from "../contract/contract";
import axios from "axios";
function AdminOrders() {

   const [orders, setOrders] = useState([])
   const [withdrawing, setWithdrawing] = useState(false);
   const [shippingId, setShippingId] = useState(null);

   const loadOrders = async () => {
      try {
         const res = await fetch("http://localhost:3000/api/orders");
         const data = await res.json();

         console.log("ADMIN ORDERS DATA:", data);

         if (!res.ok) {
            throw new Error(data.message || "Lỗi lấy đơn hàng");
         }

         setOrders(data || []);
      } catch (err) {
         console.error("LOAD ORDER ERROR:", err);
         setOrders([]);
      }
   };

   // Load lần đầu & lắng nghe event real-time
   useEffect(() => {
      loadOrders();

      const handler = () => loadOrders();
      window.addEventListener("adminOrderUpdated", handler);

      return () => window.removeEventListener("adminOrderUpdated", handler);
   }, [])

   // const markDelivered = async (orderId) => {
   //    try {
   //       const contract = await getContractWithSigner();
   //       const tx = await contract.markDelivered(orderId);
   //       await tx.wait();

   //       const res = await fetch(`http://localhost:3000/api/orders/${orderId}/shipping-status`, {
   //          method: "PUT",
   //          headers: {
   //             "Content-Type": "application/json",
   //          },
   //          body: JSON.stringify({ shipping_status: "delivered" }),
   //       });

   //       const data = await res.json();

   //       if (!res.ok) {
   //          alert(data.message || "Cập nhật trạng thái delivered thất bại");
   //          return;
   //       }

   //       setOrders((prev) =>
   //          prev.map((item) =>
   //             item.order_id === orderId
   //                ? { ...item, shipping_status: "delivered" }
   //                : item
   //          )
   //       );

   //       alert("Đơn hàng đã được đánh dấu là Đã giao");
   //    } catch (err) {
   //       console.error("Mark delivered error:", err);
   //       alert("Cập nhật thất bại");
   //    }
   // };
   const handleWithdraw = async () => {
      try {
         setWithdrawing(true);

         const contract = await getContractWithSigner();
         console.log("typeof contract.withdraw =", typeof contract.withdraw);
         console.log(
            "ABI has withdraw =",
            contract.interface.fragments.some(
               (f) => f.type === "function" && f.name === "withdraw"
            )
         );
         console.log(
            "All function names =",
            contract.interface.fragments
               .filter((f) => f.type === "function")
               .map((f) => f.name)
         );
         const locked = await contract.lockedBalance();
         const withdrawable = await contract.withdrawableBalance();

         console.log("Locked balance:", locked.toString());
         console.log("Withdrawable balance:", withdrawable.toString());
         const tx = await contract.withdraw();

         console.log("Withdraw tx:", tx.hash);

         await tx.wait();
         alert("Rút tiền thành công về ví owner");
      } catch (err) {
         console.error("Withdraw error:", err);
         alert(err.reason || err.shortMessage || err.message || "Rút tiền thất bại");
      } finally {
         setWithdrawing(false);
      }
   };

   // const handleShipOrder = async (order) => {
   //    try {
   //       console.log("ORDER SHIP CLICK:", order);

   //       const blockchain_order_index = order.blockchain_order_index;

   //       if (blockchain_order_index == null) {
   //          throw new Error("Thiếu blockchain_order_index");
   //       }

   //       const contract = await getContractWithSigner();
   //       const tx = await contract.markDelivered(blockchain_order_index);
   //       await tx.wait();

   //       const res = await axios.put(
   //          `http://localhost:3000/api/orders/${order.order_id}/shipping-status`,
   //          { shipping_status: "shipping" }
   //       );

   //       console.log("Ship API response:", res.data);

   //       alert("Đã giao hàng");
   //       loadOrders();
   //    } catch (err) {
   //       console.error("Lỗi handleShipOrder:", err);
   //       alert(err.response?.data?.message || err.message || "Lỗi server");
   //    }
   // };
   const handleShipOrder = async (order) => {
      try {
         setShippingId(order.order_id);

         console.log("ORDER SHIP CLICK:", order);

         const blockchain_order_index = order.blockchain_order_index;

         if (blockchain_order_index == null) {
            throw new Error("Thiếu blockchain_order_index");
         }

         const contract = await getContractWithSigner();
         const tx = await contract.markDelivered(blockchain_order_index);
         await tx.wait();

         const res = await axios.put(
            `http://localhost:3000/api/orders/${order.order_id}/shipping-status`,
            { shipping_status: "shipping" }
         );

         console.log("Ship API response:", res.data);

         alert("Đã giao hàng");
         loadOrders();
      } catch (err) {
         console.error("Lỗi handleShipOrder:", err);
         alert(err.response?.data?.message || err.message || "Lỗi server");
      } finally {
         setShippingId(null);
      }
   };
   return (
      <div style={{ padding: "40px" }}>
         <h1>Admin Orders</h1>
         <div className="container py-5">
            <h2 className="mb-4">Quản lý đơn hàng</h2>
            <button
               className="btn btn-primary"
               onClick={handleWithdraw}
               disabled={withdrawing}
            >
               {withdrawing ? "Đang rút..." : "Rút tiền về ví owner"}
            </button>
            {orders.length === 0 && <p>Chưa có đơn hàng nào</p>}
            {orders.map((o) => (
               <div key={o.order_id} className="card mb-4 shadow-sm">
                  <div className="card-body">
                     <div className="d-flex justify-content-between mb-3">
                        <h5 className="fw-bold m-0">Cake Shop</h5>
                        <span
                           className={`badge ${o.shipping_status === "delivered"
                              ? "bg-success"
                              : o.shipping_status === "shipping"
                                 ? "bg-info text-dark"
                                 : "bg-warning text-dark"
                              }`}
                        >
                           {o.shipping_status === "delivered"
                              ? "Đã giao"
                              : o.shipping_status === "shipping"
                                 ? "Đang giao"
                                 : "Chờ xử lý"}
                        </span>
                     </div>
                     <hr />
                     <div className="d-flex justify-content-between align-items-center">
                        <h5 className="price fw-bold m-0">
                           Tổng: {Number(o.total_price || 0).toLocaleString("vi-VN")} ROSE
                        </h5>
                        <div>
                           {o.shipping_status === "pending" && (
                              <button
                                 className="btn btn-primary me-2"
                                 disabled={shippingId === o.order_id || o.shipping_status === "delivered"}
                                 onClick={() => handleShipOrder(o)}
                              >
                                 {shippingId === o.order_id
                                    ? "⏳ Đang giao..."
                                    : o.status === "delivered"
                                       ? "✅ Đã giao hàng"
                                       : "🚚 Giao hàng"}
                              </button>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}

export default AdminOrders;