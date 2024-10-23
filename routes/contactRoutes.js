const express = require("express");
const {
  createMessage,
  getMessages,
  deleteMessage,
} = require("../controllers/contactController");
const { createMessageSchema } = require("../validators/contactValidation");
const validateRequest = require("../middleware/middelewareContact"); 

const verifyAdmin = require("../middleware/verifyAdmin2");
const verifyUser = require("../middleware/verifyToken");

const router = express.Router();


router.post("/", verifyUser, validateRequest(createMessageSchema), createMessage);

router.get("/", verifyAdmin, getMessages);
router.delete("/:id", verifyAdmin, deleteMessage);

module.exports = router;
