const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const cakeRoutes = require("./routes/cakeRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 connect DB
connectDB();

// 🔥 routes
app.use("/api", authRoutes);
app.use("/api/cakes", cakeRoutes);
app.use("/api/orders", orderRoutes);

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});