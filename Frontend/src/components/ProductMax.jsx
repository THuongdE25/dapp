import { getContract } from "../contract/contract";
import { ethers } from "ethers";

function ProductMax({ cake }) {
  const buyCake = async () => {
    try {
      const quantity = 1;
      const contract = await getContract();

      const blockchainId = Number(cake.blockchain_id);
      const unitPrice = Number(cake.blockchain_price);

      if (!Number.isInteger(blockchainId) || blockchainId <= 0) {
        alert("San pham nay chua duoc sync blockchain");
        return;
      }

      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        alert("San pham nay chua co blockchain_price hop le");
        return;
      }

      await contract.getCake(blockchainId);

      const tx = await contract.orderCake(blockchainId, quantity, {
        value: ethers.parseEther((unitPrice * quantity).toFixed(6)),
      });

      await tx.wait();
      alert("Mua thanh cong!");
    } catch (err) {
      console.error(err);
      alert("Loi khi mua!");
    }
  };

  return (
    <div className="col-md-3 mb-4">
      <div className="card product-card">
        <span className="badge sale-badge color">Ban chay</span>

        <div className="img-wrapper">
          <img src={cake.image_url} className="card-img-top product-img" alt={cake.name} />

          <button className="cart-btn" onClick={buyCake}>
            Cart
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
