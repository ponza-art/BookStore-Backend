const express = require("express");
const router = express.Router();
const { processOrderAndPayment, confirmPaymentAndUpdateOrder } = require("../controllers/paymobController");
const verifyToken = require("../middleware/verifyToken");

// Route to process order and generate payment token for iframe
router.post("/", verifyToken, processOrderAndPayment);

// Route to confirm payment after iframe interaction (combined webhook handling)
router.post("/confirm-payment", verifyToken, confirmPaymentAndUpdateOrder);

module.exports = router;
