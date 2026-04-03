import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const wallet = localStorage.getItem("wallet");

  if (!wallet) {
    return <Navigate to="/connect-wallet" />;
  }

  // nếu là admin
  const ADMIN_ADDRESS = "0xCfDE3b2f02EBCB2bF9191Bab461a7235B0C64F40";

  if (role === "admin" && wallet.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;