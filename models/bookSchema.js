const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,  // Book price
    required: true,
  },
  category: {
    type: String,  // Book category
    required: true,
  },
  author: {
    type: String,  // Book author
    required: true,
  },
  coverImage: {
    type: String,  // URL for book cover image
    required: true,
  },
  samplePdf: {
    type: String,  // URL for book sample PDF
    required: true,
  },
  sourcePath: {
    type: String,  // URL for full book file
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
