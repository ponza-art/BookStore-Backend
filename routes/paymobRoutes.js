const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/paymobController");
const verifyToken = require("../middleware/verifyToken");


router.post("/",verifyToken,  createOrder);
// router.get("/", verifyToken, getOrderById);
// router.delete("/:id", verifyToken, deleteOrder);

module.exports = router;
