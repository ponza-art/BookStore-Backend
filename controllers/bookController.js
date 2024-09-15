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
  
      // Remove spaces from the filename
      const sanitizedFilename = file.originalname.replace(/\s+/g, '_');
      const filePath = path.join(__dirname, '../uploads', sanitizedFilename);
      
      // Rename the file locally
      fs.renameSync(file.path, filePath);
  
      // Prepare Firebase file path
      const firebaseFile = bucket.file(`books/${sanitizedFilename}`);
  
      // Upload to Firebase
      await bucket.upload(filePath, { destination: firebaseFile });
  
      const [url] = await firebaseFile.getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
      });
  
      // Create and save book document
      const book = new Book({
        title,
        description,
        sourcePath: url,
      });
  
      await book.save();
  
      // Clean up local file
      fs.unlinkSync(filePath);
  
      res.status(201).json(book);
    } catch (error) {
      next(error);
    }
  };

const updateBookById = async (req, res, next) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
  
      
      if (req.file) {
        
        if (book.sourcePath) {

            const previousFileName = book.sourcePath.replace(/\s+/g, '_').split("/").pop().split("?")[0]; 
            const previousFile = bucket.file(`books/${previousFileName.replace(/\s+/g, '_')}`); 
            await previousFile.delete(); 
        }
  
        
        const filePath = path.join(__dirname, "../uploads", req.file.filename);
        const firebaseFile = bucket.file(`books/${req.file.originalname.replace(/\s+/g, '_')}`);
        await bucket.upload(filePath, { destination: firebaseFile });
  
        
        const [url] = await firebaseFile.getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });
  
        
        req.body.sourcePath = url;
  
        
        fs.unlinkSync(filePath);
      }
  
      
      Object.assign(book, req.body);
      await book.save();
  
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
    if (book.sourcePath) {
        
        const previousFileName = book.sourcePath.split("/").pop().split("?")[0]; 
        console.log(previousFileName);
        const previousFile = bucket.file(`books/${previousFileName.trim()}`); 
        await previousFile.delete(); 
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
