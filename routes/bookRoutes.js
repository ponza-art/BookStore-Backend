// routes/bookRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { createBook, getAllBooks, getBookById, updateBookById, deleteBookById } = require('../controllers/bookController');
const upload = multer({ dest: 'uploads/' });
const verifyAdmin=require("../middleware/verifyAdmin")

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/',verifyAdmin, upload.single('file'), createBook);
router.put('/:id',verifyAdmin, upload.single('file'), updateBookById);
router.delete('/:id',verifyAdmin, deleteBookById);

module.exports = router;
