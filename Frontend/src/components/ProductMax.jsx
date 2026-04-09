import { getContract } from "../contract/contract";
import { ethers } from "ethers";

function ProductMax({ cake }) {
  // console.log("CAKE =", cake);

  const buyCake = async () => {
  try {
    const quantity = 1;
    const contract = await getContract();

    const c = await contract.getCake(cake.blockchain_id);
    console.log("Cake on chain:", c);

    const tx = await contract.orderCake(cake.blockchain_id, quantity, {
      value: ethers.parseEther((cake.blockchain_price * quantity).toString())
    });

    await tx.wait();
    alert("Mua thành công!");
  } catch (err) {
    console.error(err);
    alert("Lỗi khi mua!");
  }
};

  return (
    <div className="col-md-3 mb-4">
      <div className="card product-card">
        <span className="badge sale-badge color">Bán chạy</span>

        <div className="img-wrapper">
          <img
            src={cake.image_url}
            className="card-img-top product-img"
            alt={cake.name}

          />

          <button className="cart-btn" onClick={buyCake}>
            🛒
          </button>
        </div>

        <div className="card-body text-center">
          <h6 className="fw-bold">{cake.name}</h6>
          <p className="price">{Number(cake.price).toLocaleString("vi-VN")} ROSE</p>
        </div>
      </div>
    </div>
  );
}

export default ProductMax;