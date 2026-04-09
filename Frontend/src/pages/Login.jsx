import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Bạn cần cài MetaMask!");
        return;
      }

      // 🔥 lấy ví
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const wallet = accounts[0];

      // 🔥 gọi backend
      const res = await fetch("http://localhost:3000/api/login-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet }),
      });

      const data = await res.json();

      // 🔥 lưu user
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Lỗi login!");
    }
  };

  return (
    <div className="container py-5 text-center">
      <h2 className="mb-4">Đăng nhập bằng ví</h2>

      <button className="btn btn-primary" onClick={connectWallet}>
        🔗 Connect MetaMask
      </button>
    </div>
  );
}

export default Login;