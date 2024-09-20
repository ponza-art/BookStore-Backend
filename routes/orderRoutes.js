const express = require("express");
const router = express.Router();
const { getOrders, createOrder, deleteOrder } = require("../controllers/orderController");
const verifyUser = require("../middleware/verifyToken");

router.get("/", verifyUser, getOrders);
router.post("/", verifyUser, createOrder);
router.delete("/:id", verifyUser, deleteOrder);

module.exports = router;
