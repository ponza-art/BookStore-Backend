const express = require("express");
const router = express.Router();
const { getAllOrders, createOrder, deleteOrder } = require("../controllers/orderController");
const verifyUser = require("../middleware/verifyToken");

router.get("/", verifyUser, getAllOrders);
router.post("/", verifyUser, createOrder);
router.delete("/:id", verifyUser, deleteOrder);

module.exports = router;
