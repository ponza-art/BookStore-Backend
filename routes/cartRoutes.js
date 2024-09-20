const express = require("express");
const router = express.Router();
const { getCart, addItemToCart, removeItemFromCart, clearCart } = require("../controllers/cartController");
const verifyUser = require("../middleware/verifyToken");

router.get("/", verifyUser, getCart);
router.post("/", verifyUser, addItemToCart);
router.delete("/remove-item", verifyUser, removeItemFromCart);
router.delete("/clear", verifyUser, clearCart);

module.exports = router;
