const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders } = require("../controllers/orderController");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getAllOrders);
// router.get("/", verifyToken, getOrderById);
// router.delete("/:id", verifyToken, deleteOrder);

module.exports = router;
