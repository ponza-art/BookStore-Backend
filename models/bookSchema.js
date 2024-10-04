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
  originalPrice: {
    type: Number,
    required: true,
  },
  discountedPrice: {
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
  discountPercentage: {
    type: Number,   
    default: 0,     
  }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
