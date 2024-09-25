const express = require("express");

const router = express.Router();

const {
  getCart,
  addToCart,
  deleteFromCart,
} = require("../controllers/cartController");

const verifyUser = require("../middleware/verifyToken");

router.get("/", verifyUser, getCart);
router.post("/", verifyUser, addToCart);
router.delete("/remove-item", verifyUser, deleteFromCart);

module.exports = router;
