const Cart = require("../models/cartSchema");
const Order = require("../models/orderSchema");
const bucket = require("../config/firebaseConfig");
const Book = require("../models/bookSchema");
const Favorites = require("../models/favoritesSchema");
const Author = require("../models/authorSchema");
const Category = require("../models/categoryShema");

const AppError = require("../utils/appError");

const getBooks = async (req, res, next) => {
  try {
    const {
      author,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    // Build a dynamic filter object
    const filter = {};

    if (author) {
      filter.author = author;
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice); // Greater than or equal to minPrice
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice); // Less than or equal to maxPrice
      }
    }

    // Pagination
    const skip = (page - 1) * limit;
    const books = await Book.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .exec();

    // Get total count for pagination
    const totalBooks = await Book.countDocuments(filter);
    const booksDataWithoutSourcePath = books.map(book => {
      const { sourcePath, ...bookDataWithoutSourcePath } = book.toObject();
      return bookDataWithoutSourcePath; // 
    });
   
    res.json({
      booksDataWithoutSourcePath ,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: Number(page),
    });
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

    
    let responseData = {};

    
    if (!req.user) {
      const { sourcePath, ...bookDataWithoutsourcePath } = book.toObject(); 
      responseData = bookDataWithoutsourcePath; 
    } else {
      const userId = req.user.id;
      const orders = await Order.find({ userId: userId });
      
      let hasOrderedBook = false;

      
      for (const order of orders) {
        for (const bookItem of order.books) {
          if (bookItem.bookId.toString() === req.params.id) {
            hasOrderedBook = true; 
            break; 
          }
        }
        if (hasOrderedBook) break;
      }

      
      if (hasOrderedBook) {
        responseData = book.toObject(); 
      } else {
        const { sourcePath, ...bookDataWithoutsourcePath } = book.toObject();
        responseData = bookDataWithoutsourcePath; 
      }
    }

    
    return res.json(responseData);
  } catch (error) {
    next(error);
  }
};



const createBook = async (req, res, next) => {
  try {
    const { title, description, price, category, authorName } = req.body;
    const bookFile = req.files["file"][0];
    const coverImageFile = req.files["cover"][0];
    const samplePdfFile = req.files["sample"][0];

    if (!bookFile || !coverImageFile || !samplePdfFile) {
      return res
        .status(400)
        .json({ error: "All files (book, cover, sample) must be provided" });
    }
    const author = await Author.findOne({ name: authorName });
    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }

    const categoryDoc = await Category.findOne({ title: category });
    if (!categoryDoc) {
      return res.status(404).json({ error: "Category not found" });
    }

    const sanitizedBookFilename = bookFile.originalname.replace(/\s+/g, "_");
    const firebaseBookFile = bucket.file(`books/${sanitizedBookFilename}`);
    const bookStream = firebaseBookFile.createWriteStream({
      metadata: { contentType: bookFile.mimetype },
    });
    bookStream.end(bookFile.buffer);
    const sanitizedCoverFilename = coverImageFile.originalname.replace(
      /\s+/g,
      "_"
    );
    const firebaseCoverFile = bucket.file(`covers/${sanitizedCoverFilename}`);
    const coverStream = firebaseCoverFile.createWriteStream({
      metadata: { contentType: coverImageFile.mimetype },
    });
    coverStream.end(coverImageFile.buffer);
    const sanitizedSampleFilename = samplePdfFile.originalname.replace(
      /\s+/g,
      "_"
    );
    const firebaseSampleFile = bucket.file(
      `samples/${sanitizedSampleFilename}`
    );
    const sampleStream = firebaseSampleFile.createWriteStream({
      metadata: { contentType: samplePdfFile.mimetype },
    });
    sampleStream.end(samplePdfFile.buffer);

    bookStream.on("finish", async () => {
      const [bookUrl] = await firebaseBookFile.getSignedUrl({
        action: "read",
        expires: "03-09-2491",
      });
      const [coverUrl] = await firebaseCoverFile.getSignedUrl({
        action: "read",
        expires: "03-09-2491",
      });
      const [sampleUrl] = await firebaseSampleFile.getSignedUrl({
        action: "read",
        expires: "03-09-2491",
      });
      const newBook = new Book({
        title,
        description,
        price,
        category,
        author: author.name,
        sourcePath: bookUrl,
        coverImage: coverUrl,
        samplePdf: sampleUrl,
      });
      await newBook.save();

      await Category.findByIdAndUpdate(
        categoryDoc._id,
        { $push: { books: newBook._id } },
        { new: true, useFindAndModify: false }
      );

      await Author.findByIdAndUpdate(
        author._id,
        { $push: { books: { bookId: newBook._id } } },
        { new: true, useFindAndModify: false }
      );
      res.status(201).json({ book: newBook, author: author.name });
    });
    bookStream.on("error", (error) => next(error));
    coverStream.on("error", (error) => next(error));
    sampleStream.on("error", (error) => next(error));
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

    if (req.body.authorName) {
      const author = await Author.findOne({ name: req.body.authorName });
      if (!author) {
        return res.status(404).json({ error: "Author not found" });
      }
      req.body.author = author.name;
    }

    // Delete previous files and upload new files if provided
    if (req.files) {
      const uploadPromises = [];
      const deletePromises = [];

      // Delete and upload new book file if provided
      if (req.files["file"] && book.sourcePath) {
        const previousBookFileName = book.sourcePath
          .split("/")
          .pop()
          .split("?")[0]
          .trim();
        deletePromises.push(
          bucket.file(`books/${previousBookFileName}`).delete()
        );

        const bookFile = req.files["file"][0];
        uploadPromises.push(
          uploadFileToFirebase(bookFile, "books").then((url) => {
            req.body.sourcePath = url;
          })
        );
      }

      // Delete and upload new cover image file if provided
      if (req.files["cover"] && book.coverImage) {
        const previousCoverFileName = book.coverImage
          .split("/")
          .pop()
          .split("?")[0]
          .trim();
        deletePromises.push(
          bucket.file(`covers/${previousCoverFileName}`).delete()
        );

        const coverImageFile = req.files["cover"][0];
        uploadPromises.push(
          uploadFileToFirebase(coverImageFile, "covers").then((url) => {
            req.body.coverImage = url;
          })
        );
      }

      // Delete and upload new sample PDF file if provided
      if (req.files["sample"] && book.samplePdf) {
        const previousSampleFileName = book.samplePdf
          .split("/")
          .pop()
          .split("?")[0]
          .trim();
        deletePromises.push(
          bucket.file(`samples/${previousSampleFileName}`).delete()
        );

        const samplePdfFile = req.files["sample"][0];
        uploadPromises.push(
          uploadFileToFirebase(samplePdfFile, "samples").then((url) => {
            req.body.samplePdf = url;
          })
        );
      }

      // Delete previous files and upload new files
      await Promise.all(deletePromises);
      await Promise.all(uploadPromises);
    }

    // Update the book document with the new data
    Object.assign(book, req.body);
    await book.save();

    res.json(book);
  } catch (error) {
    next(new AppError("Failed to update book: " + error, 500));
  }
};

// Helper function to upload file to Firebase and get the URL
const uploadFileToFirebase = (file, folder) => {
  return new Promise((resolve, reject) => {
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_").trim();
    const firebaseFile = bucket.file(`${folder}/${sanitizedFilename}`);
    const fileStream = firebaseFile.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    fileStream.on("error", (err) => reject(err));
    fileStream.on("finish", async () => {
      try {
        const [url] = await firebaseFile.getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });

    fileStream.end(file.buffer);
  });
};

const deleteBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const category = await Category.findOne({ title: book.category });
    if (category) {
      category.books = category.books.filter(
        (b) => b.toString() !== book._id.toString()
      );
      await category.save();
    }

    // Remove the book from the author's books array
    const author = await Author.findOne({ name: book.author });

    if (author) {
      author.books = author.books.filter(
        (b) => b.bookId.toString() !== book._id.toString()
      );
      await author.save();
    }

    // Remove the book from all carts
    await Cart.updateMany(
      { "items.bookId": book._id },
      { $pull: { items: { bookId: book._id } } }
    );

    // Remove the book from all favorites
    await Favorites.updateMany(
      { "books.bookId": book._id },
      { $pull: { books: { bookId: book._id } } }
    );

    // Remove the book from all orders
    await Order.updateMany(
      { "books.bookId": book._id },
      { $pull: { books: { bookId: book._id } } }
    );

    // Delete book files from Firebase Storage
    const previousBookFileName = book.sourcePath
      .split("/")
      .pop()
      .split("?")[0]
      .trim();
    const previousBookFile = bucket.file(`books/${previousBookFileName}`);
    await previousBookFile.delete();

    const previousCoverFileName = book.coverImage
      .split("/")
      .pop()
      .split("?")[0]
      .trim();
    const previousCoverFile = bucket.file(`covers/${previousCoverFileName}`);
    await previousCoverFile.delete();

    const previousSampleFileName = book.samplePdf
      .split("/")
      .pop()
      .split("?")[0]
      .trim();
    const previousSampleFile = bucket.file(`samples/${previousSampleFileName}`);
    await previousSampleFile.delete();

    // Remove the book from the database
    await Book.findByIdAndDelete(book._id);

    res.json({ message: "Book and related data deleted" });
  } catch (error) {
    next(new AppError("Failed to delete book: " + error, 500));
  }
};

const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBooks,
  getBookById,
  createBook,
  updateBookById,
  deleteBookById,
};
