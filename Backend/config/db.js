const sql = require("mssql");

const config = {
  user: "sa",
  password: "123456",
  server: "localhost",
  port: 1434,
  database: "Dapp_CakeShop",
  options: {
    trustServerCertificate: true,
  },
};

const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log("Kết nối DB thành công");
  } catch (err) {
    console.error("Lỗi DB:", err);
  }
};

module.exports = { sql, connectDB };