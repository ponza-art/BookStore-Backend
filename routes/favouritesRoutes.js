const express = require("express");
const router = express.Router();
const { addToFavorites,getFavorites,deleteFromFavorites } = require("../controllers/favoritesController");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, addToFavorites);
router.get("/", verifyToken, getFavorites);
router.delete("/", verifyToken, deleteFromFavorites);
// Add routes for other CRUD operations

module.exports = router;
