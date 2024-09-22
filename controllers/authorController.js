const author = require("../models/authorSchema");
const book = require("../models/bookSchema");
const bucket = require("../config/firebaseConfig");
const AppError = require("../utils/appError");

const createAuthor = async (req, res, next) => {
  try {
    // const { name } = req.body;
    // const image = req.files["file"][0];
    // if (!image || !name) {
    //   return res.status(400).json({ error: "Author data must be provided" });
    // }
    // const sanitizedimaageFilename = image.originalname.replace(/\s+/g, "_");
    // const firebaseimageFile = bucket.file(`authors/${sanitizedimaageFilename}`);
    // const imageStream = firebaseimageFile.createWriteStream({
    //   metadata: { contentType: image.mimetype },
    // });
    // imageStream.end(imageFile.buffer);
    // imageStream.on("finish", async () => {
    //   const [imageUrl] = await firebaseimageFile.getSignedUrl({
    //     action: "read",
    //     expires: "03-09-2491",
    //   });
    //   const author = new author({
    //     name,
    //     image: imageUrl,
    //   });
    //   await author.save();
    //   res.status(201).json(author);
    // });
    // imageStream.on("error", (error) => next(error));

    const newAuthor = await author.create(req.body);
    res.json(newAuthor);
  } catch (error) {
    next(new AppError("Failed to create author" + error, 500));
  }
};

const updateAuthor = async (req, res, next) => {
  const { id } = req.params;
  try {
    const updateAuthor = await author.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateAuthor);
  } catch (error) {
    next(new AppError("Failed to update author" + error, 500));
  }
};
const deleteAuthor = async (req, res, next) => {
  const { id } = req.params;
  try {
    const authorData = await author.findById(id);

    if (!authorData) {
      return res.status(404).json({ error: "Author not found" });
    }

    // Delete all books created by the author
    const books = await book.find({ author: authorData._id }); // Correct reference
    for (const b of books) {
      const previousBookFileName = b.sourcePath
        .split("/")
        .pop()
        .split("?")[0]
        .trim();
      const previousBookFile = bucket.file(`books/${previousBookFileName}`);
      await previousBookFile.delete();

      const previousCoverFileName = b.coverImage
        .split("/")
        .pop()
        .split("?")[0]
        .trim();
      const previousCoverFile = bucket.file(`covers/${previousCoverFileName}`);
      await previousCoverFile.delete();

      const previousSampleFileName = b.samplePdf
        .split("/")
        .pop()
        .split("?")[0]
        .trim();
      const previousSampleFile = bucket.file(
        `samples/${previousSampleFileName}`
      );
      await previousSampleFile.delete();

      await book.findByIdAndDelete(b._id); // Use the Book model to delete the document
    }

    // Clear the author's books array
    authorData.books = [];
    await authorData.save();

    // Delete the author
    await author.findByIdAndDelete(id); // Correctly delete the author
    res.json({ message: "Author and their books deleted successfully" });
  } catch (error) {
    next(new AppError("Failed to delete author and books: " + error, 500));
  }
};

const getAuthorById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const authorData = await author.findById(id);
    res.json(authorData);
  } catch (error) {
    next(new AppError("Failed to get author" + error, 500));
  }
};

const getAllAuthors = async (req, res, next) => {
  try {
    const getAllAuthors = await author.find();
    res.json(getAllAuthors);
  } catch (error) {
    next(new AppError("Failed to get authors" + error, 500));
  }
};
module.exports = {
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorById,
  getAllAuthors,
};
