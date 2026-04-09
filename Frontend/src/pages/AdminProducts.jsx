import { useEffect, useState } from "react";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image_url: "",
    category: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);

  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/cakes");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi load products:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      image_url: "",
      category: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `http://localhost:3000/api/cakes/${editingId}`
        : "http://localhost:3000/api/cakes";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message || "Thành công");

      resetForm();
      loadProducts();
    } catch (err) {
      console.error("Lỗi submit:", err);
      alert("Có lỗi xảy ra");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      price: item.price || "",
      image_url: item.image_url || "",
      category: item.category || "",
      description: item.description || "",
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:3000/api/cakes/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      alert(data.message || "Đã xóa");
      loadProducts();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Quản lý sản phẩm</h2>

      <form onSubmit={handleSubmit} className="card p-3 mb-4">
        <div className="mb-3">
          <label>Tên bánh</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Giá</label>
          <input
            type="number"
            step="0.0001"
            className="form-control"
            name="price"
            value={form.price}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Ảnh</label>
          <input
            type="text"
            className="form-control"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Category</label>
          <input
            type="text"
            className="form-control"
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Mô tả</label>
          <textarea
            className="form-control"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <button type="submit" className="btn btn-primary me-2">
            {editingId ? "Cập nhật" : "Thêm sản phẩm"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Làm mới
          </button>
        </div>
      </form>

      <div className="row">
        {products.map((item) => (
          <div className="col-md-4 mb-4" key={item.id}>
            <div className="card h-100">
              <img
                src={item.image_url || item.img}
                alt={item.name}
                className="card-img-top"
                style={{ height: "220px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5>{item.name}</h5>
                <p>Giá: {item.price}</p>
                <p>Category: {item.category}</p>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleEdit(item)}
                >
                  Sửa
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminProducts;