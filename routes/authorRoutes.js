const express = require("express");
const {
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorById,
  getAllAuthors,
} = require("../controllers/authorController");

const router = express.Router();

router.post("/create", createAuthor);
router.put("/update/:id", updateAuthor);
router.delete("/delete/:id", deleteAuthor);
router.get("/:id", getAuthorById);
router.get("/", getAllAuthors);

module.exports = router;
