const express = require("express");
const {
  createMessage,
  getMessages,
  deleteMessage,
} = require("../controllers/contactController");
const verifyAdmin = require("../middleware/verifyAdmin2");
const verifyUser = require("../middleware/verifyToken");

const router = express.Router();


router.post("/", verifyUser, createMessage);


router.get("/", verifyAdmin, getMessages);
router.delete("/:id", verifyAdmin, deleteMessage);

module.exports = router;
