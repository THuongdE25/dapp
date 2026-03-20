import { createContext, useState } from "react";
export const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const addToCart = (product) => {
    const exist = cart.find((item) => item.id === product.id);
    if (exist) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1, checked: false }]);
    }
  };
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };
  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };
  const decreaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };
  const toggleCheck = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };
  return (
    <>
      <CartContext.Provider
        value={{
          cart,
          addToCart,
          removeFromCart,
          increaseQty,
          decreaseQty,
          toggleCheck,
        }}
      >
        {children}
      </CartContext.Provider>
    </>
  );
}

export default CartProvider;
