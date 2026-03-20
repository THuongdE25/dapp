import products from "../data/Products";
import ProductMax from "./ProductMax";

function CakeList() {
  return (
    <>
      <div className="container py-5">
        <h2 className="text-center mb-5 fw-bold"> SẢN PHẨM NỔI BẬT</h2>
        <div className="row">
          {products.slice(0, 16).map((cake) => (
            <ProductMax key={cake.id} cake={cake} />
          ))}
        </div>
      </div>
    </>
  );
}
export default CakeList;
