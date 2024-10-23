
const express = require("express");
const router = express.Router();
const { saveCard, getAllUserCards, deleteCard } = require("../controllers/cardController");
const verifyUser = require("../middleware/verifyToken");
const validateRequest = require("../middleware/middelwareCard");
const { cardSchemaValidation } = require("../validators/cardValidation");


router.post("/", verifyUser, validateRequest(cardSchemaValidation), saveCard);
router.get("/", verifyUser, getAllUserCards);
router.delete("/:cardId", verifyUser, deleteCard);

module.exports = router;

 