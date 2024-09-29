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
    type: Number,  
    required: true,
  },
  category: {
    type: String,  
    required: true,
  },
  author: {
    type: String,  
    required: true,
  },
  coverImage: {
    type: String,  
    required: true,
  },
  samplePdf: {
    type: String,  
    required: true,
  },
  sourcePath: {
    type: String,  
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
