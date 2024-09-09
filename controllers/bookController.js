// controllers/bookController.js
const bucket = require('../config/firebaseConfig');
const path = require('path');
const fs = require('fs');
const Book = require('../models/bookSchema');

const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filePath = path.join(__dirname, '../uploads', file.filename);
    const firebaseFile = bucket.file(`books/${file.originalname}`);
    await bucket.upload(filePath, { destination: firebaseFile });

    const [url] = await firebaseFile.getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });

    const book = new Book({
      title,
      description,
      sourcePath: url,
    });

    await book.save();
    fs.unlinkSync(filePath); 
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

const updateBookById = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    next(error);
  }
};

const deleteBookById = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBookById,
  deleteBookById,
};
