function Login() {
  return (
    <>
      <div className="container py-5">
        <h2 className="mb-4">Đăng nhập</h2>
        <input type="email" className="form-control mb-3" placeholder="Email" />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
        />
        <button className="btn btn-dark">Đăng nhập</button>
      </div>
    </>
  );
}
export default Login;
