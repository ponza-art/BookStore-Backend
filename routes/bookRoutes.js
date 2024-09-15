// routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const { createBook, getAllBooks, getBookById, updateBookById, deleteBookById } = require('../controllers/bookController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const verifyAdmin=require("../middleware/verifyAdmin")

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/',verifyAdmin, upload.single('file'), createBook);
router.put('/:id',verifyAdmin, upload.single('file'), updateBookById);
router.delete('/:id',verifyAdmin, deleteBookById);

module.exports = router;
