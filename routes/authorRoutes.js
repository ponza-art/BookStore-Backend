const express = require("express");
const {
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorById,
  getAllAuthors,
} = require("../controllers/authorController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/create",
  upload.fields([{ name: "file", maxCount: 1 }]), // Add upload middleware
  createAuthor
);

router.put(
  "/update/:id",
  upload.fields([{ name: "file", maxCount: 1 }]), // Add upload middleware
  updateAuthor
);

router.delete("/delete/:id", deleteAuthor);
router.get("/:id", getAuthorById);
router.get("/", getAllAuthors);

module.exports = router;
