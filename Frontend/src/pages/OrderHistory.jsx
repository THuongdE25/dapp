import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getContractWithSigner } from "../contract/contract";
import ProductCatalog from "../data/ProductsCatalog";
import { ethers } from "ethers";

function OrderHistory({ account }) {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!account) return;

    try {
      setLoading(true);
      const contract = await getContractWithSigner();
      const data = await contract.getMyOrders();

      const formatted = data.map((o, i) => {
        const product = ProductCatalog.find(p => p.id === Number(o.cakeId));
        return {
          id: i,
          cakeId: Number(o.cakeId),
          name: product?.name || "Unknown Cake",
          img: product?.img || "",
          quantity: Number(o.quantity),
          total: parseFloat(ethers.formatEther(o.totalPrice)),
          timestamp: Number(o.timestamp),
          delivered: o.delivered,
        };
      });

      setOrders(formatted);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ✅ Load orders lần đầu & lắng nghe event realtime
  useEffect(() => {
    loadOrders();

    const handler = () => loadOrders();
    window.addEventListener("orderUpdated", handler);

    return () => window.removeEventListener("orderUpdated", handler);
  }, [account]);

  // Reload khi navigate với state.refresh
  useEffect(() => {
    loadOrders();
  }, [location.state?.refresh]);

  if (loading) return <h3 className="text-center mt-5">Loading...</h3>;
  if (orders.length === 0) return <h4 className="text-center mt-5">Chưa có đơn hàng nào</h4>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">📦 Lịch sử đơn hàng</h2>
      {orders.map(o => (
        <div key={o.id} className="card1 mb-4 shadow-sm">
          <div className="card1-body">
            <div className="d-flex justify-content-between mb-3">
              <h5 className="fw-bold m-0">🍰 Cake Shop</h5>
              <span className={`badge ${o.delivered ? "bg-success" : "bg-warning text-dark"}`}>
                {o.delivered ? "Đã giao" : "Đang xử lý"}
              </span>
            </div>
            <hr />
            <div className="d-flex align-items-center mb-3">
              <img src={o.img} alt={o.name} style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }} />
              <div className="ms-3 flex-grow-1">
                <h6 className="mb-2">{o.name}</h6>
                <small className="text-muted">Số lượng: {o.quantity}</small>
              </div>
              <div className="fw-bold price">{o.total.toFixed(3)} ROSE</div>
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="price fw-bold m-0">Tổng: {o.total.toFixed(3)} ROSE</h5>
              <small className="text-muted">{new Date(o.timestamp * 1000).toLocaleString()}</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderHistory;