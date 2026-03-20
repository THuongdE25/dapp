import { useContext } from "react";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, removeFromCart, increaseQty, decreaseQty, toggleCheck } =
    useContext(CartContext);
  const total = cart
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  const navigate = useNavigate();
  return (
    <>
      <div className="container mt-5">
        <h2>Giỏ hàng</h2>
        {cart.length === 0 && <p>Giỏ hàng trống</p>}
        {cart.map((item) => (
          <div key={item.id} className="row border p-2 mb-3">
            <div className="col-md-1">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleCheck(item.id)}
              />
            </div>
            <div className="col-md-2">
              <img src={item.img} width="80" alt="" />
            </div>
            <div className="col-md-3">
              <h5>{item.name}</h5>
            </div>
            <div className="col-md-2">
              {item.price.toLocaleString("vi-VN")} đ
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => decreaseQty(item.id)}
              >
                -
              </button>
              <span className="mx-2">{item.quantity}</span>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => increaseQty(item.id)}
              >
                +
              </button>
            </div>
            <div className="col-md-2">
              <button
                className="btn-cart"
                onClick={() => removeFromCart(item.id)}
              >
                Xoá
              </button>
            </div>
          </div>
        ))}
        <h4 className="price">Tổng tiền: {total.toLocaleString("vi-VN")} đ</h4>
        {total > 0 && (
          <button className="btn-cart" onClick={() => navigate("/checkout")}>
            Thanh toán
          </button>
        )}
      </div>
    </>
  );
}
export default Cart;
