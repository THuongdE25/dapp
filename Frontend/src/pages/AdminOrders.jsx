import { useEffect, useState } from "react"
import { getContract } from "../contract/contract"

function AdminOrders(){

   const [orders,setOrders] = useState([])

   const loadOrders = async ()=> {
      try {
         const contract = await getContract()
         const data = await contract.getAllOrders()
         const formatted = data.map((o,index)=>({
            id:index,
            buyer:o.buyer,
            cakeId:o.cakeId.toString(),
            quantity:o.quantity.toString(),
            totalPrice:o.totalPrice.toString(),
            timestamp:o.timestamp.toString(),
            delivered:o.delivered
         }))
         setOrders(formatted)
      } catch(err) {
         console.log("LOAD ORDER ERROR", err)
      }
   }

   // Load lần đầu & lắng nghe event real-time
   useEffect(() => {
      loadOrders();

      const handler = () => loadOrders();
      window.addEventListener("adminOrderUpdated", handler);

      return () => window.removeEventListener("adminOrderUpdated", handler);
   }, [])

   const markDelivered = async(id)=> {
      try {
         const contract = await getContract()
         const tx = await contract.markDelivered(id)
         await tx.wait()
         loadOrders() // reload sau khi mark delivered
      } catch(err) {
         console.error("Mark delivered error:", err)
      }
   }

   return(
      <div style={{padding:"40px"}}>
         <h1>Admin Orders</h1>
         <div className="container py-5">
            <h2 className="mb-4">Quản lý đơn hàng</h2>
            {orders.length === 0 && <p>Chưa có đơn hàng nào</p>}
            {orders.map((o) => (
               <div key={o.id} className="card mb-4 shadow-sm">
                  <div className="card-body">
                     <div className="d-flex justify-content-between mb-3">
                        <h5 className="fw-bold m-0">Cake Shop</h5>
                        <span className={`badge ${o.delivered ? "bg-success" : "bg-warning text-dark"}`}>
                           {o.delivered ? "Đã giao" : "Chờ xử lý"}
                        </span>
                     </div>
                     <hr />
                     <div className="d-flex justify-content-between align-items-center">
                        <h5 className="price fw-bold m-0">
                           Tổng: {(Number(o.totalPrice)/1e18).toLocaleString("vi-VN")} ROSE
                        </h5>
                        <div>
                           {!o.delivered && (
                              <button className="btn btn-success me-2" onClick={() => markDelivered(o.id)}>
                                 ✔ Giao
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