const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, deleteOrder } = require("../controllers/orderController");
const verifyToken = require("../middleware/verifyToken");

router.post("/orders", verifyToken, createOrder);
router.get("/orders", verifyToken, getAllOrders);
router.get("/orders/:id", verifyToken, getOrderById);
router.delete("/orders/:id", verifyToken, deleteOrder);

module.exports = router;
