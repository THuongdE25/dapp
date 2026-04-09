import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function Cakes() {
  const { category } = useParams();

  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        let url = "http://localhost:3000/api/cakes";

        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
        }

        console.log("Đang gọi API:", url);

        const res = await fetch(url);
        const data = await res.json();

        setCakes(data);
      } catch (err) {
        console.error("Lỗi load cakes:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category]);

  if (loading) return <h3>Loading...</h3>;

  return (
    <div className="container mt-4">
      <div className="row">
        {cakes.map((cake) => (
          <div key={cake.id} className="col-md-3 mb-3">
            <div className="card h-100 text-center p-2">
              <img
                src={cake.image_url}
                alt={cake.name}
                className="img-fluid"
              />

              <h5 className="mt-2">{cake.name}</h5>

              <p>{cake.price} ROSE</p>

              {(cake.quantity ?? 0) > 0 ? (
               <span style={{ color: "green" }}>Còn hàng</span>
               ) : (
               <span style={{ color: "red" }}>Hết hàng</span>
               )}

 <Link to={`/product/${cake.id}`}                 className="btn-cart mt-2"
>
  Xem chi tiết
</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cakes;