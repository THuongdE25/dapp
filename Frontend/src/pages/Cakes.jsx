import { useEffect, useState } from "react";
import { getContract } from "../contract/contract";
import ProductCatalog from "../data/ProductsCatalog";
import { ethers } from "ethers";

function Cakes() {
  const [cakes, setCakes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const contract = await getContract();

      const final = await Promise.all(
        ProductCatalog.map(async (cake) => {
          try {
            const onChain = await contract.getCake(cake.id);

            return {
              ...cake,
              price: ethers.formatEther(onChain.price), 
              isAvailable: onChain.isAvailable,
            };
          } catch (err) {
            return {
              ...cake,
              price: "0",
              isAvailable: false,
            };
          }
        })
      );

      setCakes(final);
    };

    loadData();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row">
        {cakes.map((cake) => (
          <div key={cake.id} className="col-md-3">
            <div className="card">
              <img src={cake.img} alt="" />
              <h5>{cake.name}</h5>
              <p>{cake.price} ROSE</p>

              {!cake.isAvailable && (
                <span style={{ color: "red" }}>Hết hàng</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cakes;