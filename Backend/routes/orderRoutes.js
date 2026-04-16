const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateShippingStatus,
  confirmReceived
} = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/my-orders", getMyOrders);
router.put("/:id/shipping-status", updateShippingStatus);
router.put("/:id/confirm-received", confirmReceived);

module.exports = router;