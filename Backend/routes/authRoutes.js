const express = require("express");
const router = express.Router();
const { loginWallet } = require("../controllers/authController");

router.post("/login-wallet", loginWallet);

module.exports = router;