const express = require("express");
const router = express.Router();
const cakeController = require("../controllers/cakeController");

router.get("/", cakeController.getCakes);
router.get("/:id", cakeController.getCakeById);

router.post("/", cakeController.createCake);        // thêm sản phẩm
router.put("/:id", cakeController.updateCake);      // sửa sản phẩm
router.delete("/:id", cakeController.deleteCake);   // xóa sản phẩm

module.exports = router;