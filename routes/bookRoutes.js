// routes/bookRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { createBook, getAllBooks, getBookById, updateBookById, deleteBookById } = require('../controllers/bookController');
const upload = multer({ dest: 'uploads/' });

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', upload.single('file'), createBook);
router.put('/:id', updateBookById);
router.delete('/:id', deleteBookById);

module.exports = router;
