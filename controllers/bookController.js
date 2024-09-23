const bucket = require("../config/firebaseConfig");
const Book = require("../models/bookSchema");
const Author = require("../models/authorSchema");
const AppError = require("../utils/appError");

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
      // Find the author by name
      const author = await Author.findOne({ name: req.body.authorName });
      if (!author) {
        return res.status(404).json({ error: "Author not found" });
      }
      // Assign the author's ID to the book's author field
      req.body.author = author.name;
    }

    if (req.files) {
      // Delete previous files from Firebase if they exist
      if (book.sourcePath) {
        const previousBookFileName = book.sourcePath
          .split("/")
          .pop()
          .split("?")[0];
        const previousBookFile = bucket.file(
          `books/${previousBookFileName.trim()}`
        );
        await previousBookFile.delete();
      }
      if (book.coverImage) {
        const previousCoverFileName = book.coverImage
          .split("/")
          .pop()
          .split("?")[0];
        const previousCoverFile = bucket.file(
          `covers/${previousCoverFileName.trim()}`
        );
        await previousCoverFile.delete();
      }
      if (book.samplePdf) {
        const previousSampleFileName = book.samplePdf
          .split("/")
          .pop()
          .split("?")[0];
        const previousSampleFile = bucket.file(
          `samples/${previousSampleFileName.trim()}`
        );
        await previousSampleFile.delete();
      }

      // Upload new files to Firebase
      const bookFile = req.files["file"][0];
      const coverImageFile = req.files["cover"][0];
      const samplePdfFile = req.files["sample"][0];

      const sanitizedBookFilename = bookFile.originalname
        .replace(/\s+/g, "_")
        .trim();
      const firebaseBookFile = bucket.file(`books/${sanitizedBookFilename}`);
      const bookStream = firebaseBookFile.createWriteStream({
        metadata: { contentType: bookFile.mimetype },
      });
      bookStream.end(bookFile.buffer);

      const sanitizedCoverFilename = coverImageFile.originalname
        .replace(/\s+/g, "_")
        .trim();
      const firebaseCoverFile = bucket.file(`covers/${sanitizedCoverFilename}`);
      const coverStream = firebaseCoverFile.createWriteStream({
        metadata: { contentType: coverImageFile.mimetype },
      });
      coverStream.end(coverImageFile.buffer);

      const sanitizedSampleFilename = samplePdfFile.originalname
        .replace(/\s+/g, "_")
        .trim();
      const firebaseSampleFile = bucket.file(
        `samples/${sanitizedSampleFilename}`
      );
      const sampleStream = firebaseSampleFile.createWriteStream({
        metadata: { contentType: samplePdfFile.mimetype },
      });
      sampleStream.end(samplePdfFile.buffer);

      // When all files are uploaded
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

        // Update the book fields in the request body with the new URLs
        req.body.sourcePath = bookUrl;
        req.body.coverImage = coverUrl;
        req.body.samplePdf = sampleUrl;

        // Apply the changes to the book document
        Object.assign(book, req.body);
        await book.save();
        res.json(book);
      });

      bookStream.on("error", (error) => next(error));
      coverStream.on("error", (error) => next(error));
      sampleStream.on("error", (error) => next(error));
    } else {
      // If no files are being uploaded, just update other fields
      Object.assign(book, req.body);
      await book.save();
      res.json(book);
    }
  } catch (error) {
    next(error);
  }
};

const deleteBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Remove the book from the author's books array
    const author = await Author.findById(book.author);
    if (author) {
      author.books = author.books.filter(
        (b) => b.bookId.toString() !== book._id.toString()
      );
      await author.save();
    }

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
    await Book.findByIdAndDelete(book._id); // Use findByIdAndDelete instead of book.remove()

    res.json({ message: "Book deleted" });
  } catch (error) {
    next(new AppError("Failed to delete book: " + error, 500));
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBookById,
  deleteBookById,
};
