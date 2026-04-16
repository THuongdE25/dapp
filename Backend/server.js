// require("dotenv").config();

// console.log("OWNER_PRIVATE_KEY loaded:", process.env.OWNER_PRIVATE_KEY ? "YES" : "NO");

// const express = require("express");
// const cors = require("cors");

// const { connectDB } = require("./config/db");

// const authRoutes = require("./routes/authRoutes");
// const cakeRoutes = require("./routes/cakeRoutes");
// const orderRoutes = require("./routes/orderRoutes");

// const app = express();

// app.use(cors());
// app.use(express.json());

// connectDB();

// app.use("/api", authRoutes);
// app.use("/api/cakes", cakeRoutes);
// app.use("/api/orders", orderRoutes);

// app.use((err, req, res, next) => {
//   console.error("Server error:", err);
//   res.status(500).json({ message: err.message || "Internal server error" });
// });

// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// app.listen(3000, () => {
//   console.log("Server running at http://localhost:3000");
// });

// __________________________
require("dotenv").config();

console.log("OWNER_PRIVATE_KEY loaded:", process.env.OWNER_PRIVATE_KEY ? "YES" : "NO");

const express = require("express");
const cors = require("cors");
const path = require("path");

const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const cakeRoutes = require("./routes/cakeRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "images")));

connectDB();

app.use("/api", authRoutes);
app.use("/api/cakes", cakeRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});