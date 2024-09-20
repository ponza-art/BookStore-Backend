const bucket = require('../config/firebaseConfig');
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
    const { title, description, price, category, author } = req.body;
    const bookFile = req.files['file'][0];
    const coverImageFile = req.files['cover'][0];
    const samplePdfFile = req.files['sample'][0];

    if (!bookFile || !coverImageFile || !samplePdfFile) {
      return res.status(400).json({ error: 'All files (book, cover, sample) must be provided' });
    }

    // Upload book file to Firebase
    const sanitizedBookFilename = bookFile.originalname.replace(/\s+/g, '_');
    const firebaseBookFile = bucket.file(`books/${sanitizedBookFilename}`);
    const bookStream = firebaseBookFile.createWriteStream({
      metadata: { contentType: bookFile.mimetype },
    });
    bookStream.end(bookFile.buffer);

    // Upload cover image to Firebase
    const sanitizedCoverFilename = coverImageFile.originalname.replace(/\s+/g, '_');
    const firebaseCoverFile = bucket.file(`covers/${sanitizedCoverFilename}`);
    const coverStream = firebaseCoverFile.createWriteStream({
      metadata: { contentType: coverImageFile.mimetype },
    });
    coverStream.end(coverImageFile.buffer);

    // Upload sample PDF to Firebase
    const sanitizedSampleFilename = samplePdfFile.originalname.replace(/\s+/g, '_');
    const firebaseSampleFile = bucket.file(`samples/${sanitizedSampleFilename}`);
    const sampleStream = firebaseSampleFile.createWriteStream({
      metadata: { contentType: samplePdfFile.mimetype },
    });
    sampleStream.end(samplePdfFile.buffer);

    bookStream.on('finish', async () => {
      const [bookUrl] = await firebaseBookFile.getSignedUrl({ action: 'read', expires: '03-09-2491' });
      const [coverUrl] = await firebaseCoverFile.getSignedUrl({ action: 'read', expires: '03-09-2491' });
      const [sampleUrl] = await firebaseSampleFile.getSignedUrl({ action: 'read', expires: '03-09-2491' });

      const book = new Book({
        title,
        description,
        price,
        category,
        author,
        sourcePath: bookUrl,
        coverImage: coverUrl,
        samplePdf: sampleUrl,
      });

      await book.save();
      res.status(201).json(book);
    });

    bookStream.on('error', (error) => next(error));
    coverStream.on('error', (error) => next(error));
    sampleStream.on('error', (error) => next(error));

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

    if (req.files) {
      // Delete old files from Firebase
      if (book.sourcePath) {
        const previousBookFileName = book.sourcePath.split("/").pop().split("?")[0];
        const previousBookFile = bucket.file(`books/${previousBookFileName.trim()}`);
        await previousBookFile.delete();
      }
      if (book.coverImage) {
        const previousCoverFileName = book.coverImage.split("/").pop().split("?")[0];
        const previousCoverFile = bucket.file(`covers/${previousCoverFileName.trim()}`);
        await previousCoverFile.delete();
      }
      if (book.samplePdf) {
        const previousSampleFileName = book.samplePdf.split("/").pop().split("?")[0];
        const previousSampleFile = bucket.file(`samples/${previousSampleFileName.trim()}`);
        await previousSampleFile.delete();
      }

      // Upload new files to Firebase
      const bookFile = req.files['file'][0];
      const coverImageFile = req.files['cover'][0];
      const samplePdfFile = req.files['sample'][0];

      // Upload new book file
      const sanitizedBookFilename = bookFile.originalname.replace(/\s+/g, '_').trim();
      const firebaseBookFile = bucket.file(`books/${sanitizedBookFilename}`);
      const bookStream = firebaseBookFile.createWriteStream({ metadata: { contentType: bookFile.mimetype } });
      bookStream.end(bookFile.buffer);

      // Upload new cover image
      const sanitizedCoverFilename = coverImageFile.originalname.replace(/\s+/g, '_').trim();
      const firebaseCoverFile = bucket.file(`covers/${sanitizedCoverFilename}`);
      const coverStream = firebaseCoverFile.createWriteStream({ metadata: { contentType: coverImageFile.mimetype } });
      coverStream.end(coverImageFile.buffer);

      // Upload new sample PDF
      const sanitizedSampleFilename = samplePdfFile.originalname.replace(/\s+/g, '_').trim();
      const firebaseSampleFile = bucket.file(`samples/${sanitizedSampleFilename}`);
      const sampleStream = firebaseSampleFile.createWriteStream({ metadata: { contentType: samplePdfFile.mimetype } });
      sampleStream.end(samplePdfFile.buffer);

      bookStream.on('finish', async () => {
        const [bookUrl] = await firebaseBookFile.getSignedUrl({ action: 'read', expires: '03-09-2491' });
        const [coverUrl] = await firebaseCoverFile.getSignedUrl({ action: 'read', expires: '03-09-2491' });
        const [sampleUrl] = await firebaseSampleFile.getSignedUrl({ action: 'read', expires: '03-09-2491' });

        req.body.sourcePath = bookUrl;
        req.body.coverImage = coverUrl;
        req.body.samplePdf = sampleUrl;

        Object.assign(book, req.body);
        await book.save();
        res.json(book);
      });

      bookStream.on('error', (error) => next(error));
      coverStream.on('error', (error) => next(error));
      sampleStream.on('error', (error) => next(error));

    } else {
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
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Delete files from Firebase
    const previousBookFileName = book.sourcePath.split("/").pop().split("?")[0].trim();
    const previousBookFile = bucket.file(`books/${previousBookFileName}`);
    await previousBookFile.delete();

    const previousCoverFileName = book.coverImage.split("/").pop().split("?")[0].trim();
    const previousCoverFile = bucket.file(`covers/${previousCoverFileName}`);
    await previousCoverFile.delete();

    const previousSampleFileName = book.samplePdf.split("/").pop().split("?")[0].trim();
    const previousSampleFile = bucket.file(`samples/${previousSampleFileName}`);
    await previousSampleFile.delete();

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
