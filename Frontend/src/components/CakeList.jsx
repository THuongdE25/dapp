import { useEffect, useState } from "react";
import ProductMax from "./ProductMax";

function CakeList() {
  const [cakes, setCakes] = useState([]);
  const [priceFilter, setPriceFilter] = useState("");
  const [sortType, setSortType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        let url = "http://localhost:3000/api/cakes";
        const params = new URLSearchParams();

        if (priceFilter) {
          params.append("mucDo", priceFilter);
        }

        if (sortType) {
          params.append("sort", sortType);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Không lấy được dữ liệu từ API");
        }

        const data = await res.json();
        setCakes(data);
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [priceFilter, sortType]);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 fw-bold">SẢN PHẨM NỔI BẬT</h2>

      <div className="mb-4 d-flex justify-content-center gap-3 flex-wrap">
        <select
          className="form-select w-auto"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="">Tất cả giá</option>
          <option value="re">Rẻ</option>
          <option value="trungbinh">Trung bình</option>
          <option value="caocap">Cao cấp</option>
        </select>

        <select
          className="form-select w-auto"
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="">Không sắp xếp</option>
          <option value="new">Mới nhất</option>
          <option value="top">Bán chạy</option>
        </select>
      </div>

      {loading && <p className="text-center">Đang tải dữ liệu...</p>}

      {error && <p className="text-center text-danger">{error}</p>}

      {!loading && !error && (
        <div className="row">
          {cakes.length > 0 ? (
            cakes.map((cake) => <ProductMax key={cake.id} cake={cake} />)
          ) : (
            <p className="text-center">Không có sản phẩm nào.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CakeList;