
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { createCheckoutSession, webhook } = require("../controllers/paymentController");

router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.post("/webhook",express.raw({ type: "application/json" }), webhook);


module.exports = router;
