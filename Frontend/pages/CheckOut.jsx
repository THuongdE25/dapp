import { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { useLocation } from "react-router-dom";

function CheckOut() {
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const items = buyNowItem ? [buyNowItem] : cart.filter((item) => item.checked);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Đặt hàng thành công");
    console.log("Thông tin:", form);
    console.log("Đơn hàng:", items);
  };

  return (
    <>
      <div className="container py-5">
        <h2 className="mb-4">Thông tin hoá đơn</h2>
        <div className="row">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Họ tên"
              name="name"
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Số điện thoại"
              name="phone"
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Địa chỉ"
              name="address"
              onChange={handleChange}
            />
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
            >
              Xác nhận đơn hàng
            </button>
          </div>
          <div className="col-md-6">
            <h5>Đơn hàng của bạn</h5>
            {items.map((item) => (
              <div className="d-flex justify-content-between" key={item.id}>
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{item.price.toLocaleString("vi-VN")} đ/1c</span>
              </div>
            ))}
            <hr />
            <h5>Tổng: {total.toLocaleString("vi-VN")} đ</h5>
          </div>
        </div>
      </div>
    </>
  );
}
export default CheckOut;
