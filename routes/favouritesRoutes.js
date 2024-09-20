const express = require("express");
const router = express.Router();
const { addToFavorites,getFavorites,deleteFromFavorites } = require("../controllers/favoritesController");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, addToFavorites);
router.get("/", verifyToken, getFavorites);
router.delete("/", verifyToken, deleteFromFavorites);

module.exports = router;
