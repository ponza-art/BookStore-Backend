const express = require("express");
const router = express.Router();
const { saveCard,getAllUserCards,deleteCard } = require("../controllers/cardController");
const verifyUser = require("../middleware/verifyToken");

router.post("/", verifyUser, saveCard);
router.get("/", verifyUser, getAllUserCards);
router.delete("/:cardId",verifyUser ,deleteCard);



module.exports = router;
 