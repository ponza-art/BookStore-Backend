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
const verifyAdmin2 = require("../middleware/verifyAdmin2");


const router = express.Router();

router.post(
  "/create",
  verifyAdmin2,
  upload.fields([{ name: "file", maxCount: 1 }]), // Add upload middleware
  createAuthor
);

router.put(
  "/update/:id",
  verifyAdmin2,
  upload.fields([{ name: "file", maxCount: 1 }]),
  updateAuthor
);

router.delete("/delete/:id", verifyAdmin2,deleteAuthor);
router.get("/:id", getAuthorById);
router.get("/", getAllAuthors);

module.exports = router;
