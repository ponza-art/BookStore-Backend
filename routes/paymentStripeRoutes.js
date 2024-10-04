
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { createCheckoutSession, webhook } = require("../controllers/paymentController");
const bodyParser = require('body-parser');


router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.post('/webhook',  webhook);


module.exports = router;
