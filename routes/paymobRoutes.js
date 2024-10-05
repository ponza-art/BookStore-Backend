const express = require("express");
const router = express.Router();
const { createOrder, confirmPayment } = require("../controllers/paymobController");
const verifyToken = require("../middleware/verifyToken");

// Route for creating order and getting payment token
router.post("/", verifyToken, createOrder);

// Route for confirming payment after iframe
router.post("/confirm-payment", verifyToken, confirmPayment);

module.exports = router;
