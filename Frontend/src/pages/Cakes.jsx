import { useEffect, useState } from "react";
import { getContract } from "../contract/contract";
import ProductCatalog from "../data/ProductsCatalog";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";

function Cakes() {
  const { category } = useParams();

  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const contract = await getContract();

      const filtered = ProductCatalog.filter((cake) =>
        category ? cake.slug.startsWith(category) : true
      );

      const final = await Promise.all(
        filtered.map(async (cake) => {
          try {
            const onChain = await contract.getCake(cake.id);

            return {
              ...cake,
              price: Number(
                ethers.formatEther(onChain.price)
              ).toFixed(3),
              isAvailable: onChain.isAvailable,
            };
          } catch {
            return {
              ...cake,
              price: "0",
              isAvailable: false,
            };
          }
        })
      );

      setCakes(final);
      setLoading(false);
    };

    loadData();
  }, [category]);

  if (loading) return <h3>Loading blockchain...</h3>;

  return (
    <div className="container mt-4">
      <div className="row">
        {cakes.map((cake) => (
          <div key={cake.id} className="col-md-3 mb-3">
            <div className="card h-100 text-center">
              <img src={cake.img} alt={cake.name} />

              <h5>{cake.name}</h5>

              <p>{cake.price} ROSE</p>

              {!cake.isAvailable && (
                <span style={{ color: "red" }}>
                  Hết hàng
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cakes;