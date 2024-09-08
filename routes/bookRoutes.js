const express = require("express");
const router = express.Router();
const {
  getBookById,
  getAllBooks,
  createBook,
  updateBookById,
  deleteBookById,
} = require("../controllers/bookController");
const validateBook = require("../middleware/middlewareBook");

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", validateBook, createBook);
router.put("/:id", validateBook, updateBookById);
router.delete("/:id", deleteBookById);

module.exports = router;
