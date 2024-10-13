const express = require("express");
const router = express.Router();
const { saveCard,getAllUserCards } = require("../controllers/cardController");
const verifyUser = require("../middleware/verifyToken");

router.post("/", verifyUser, saveCard);
router.get("/", verifyUser, getAllUserCards);


module.exports = router;
 