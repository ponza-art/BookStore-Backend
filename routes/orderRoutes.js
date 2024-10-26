const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders,getOrdersAdmin } = require("../controllers/orderController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin2");
const userStatus = require("../middleware/userStatus");


router.post("/", verifyToken,userStatus, createOrder);
router.get("/", verifyToken, getAllOrders);
router.get("/all", verifyAdmin, getOrdersAdmin);
// router.get("/", verifyToken, getOrderById);
// router.delete("/:id", verifyToken, deleteOrder);

module.exports = router;
