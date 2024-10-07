const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/paymobController");
const verifyToken = require("../middleware/verifyToken");
const userStatus = require("../middleware/userStatus");



router.post("/",verifyToken,userStatus,  createOrder);
// router.get("/", verifyToken, getOrderById);
// router.delete("/:id", verifyToken, deleteOrder);

module.exports = router;
