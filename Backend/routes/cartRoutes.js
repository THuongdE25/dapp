const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require("../controllers/cartController");

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/:id", removeCartItem);
router.delete("/", clearCart);

module.exports = router;