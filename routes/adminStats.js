const express = require('express');
const Book = require('../models/bookSchema'); 
const User = require('../models/userSchema');
const Category = require('../models/categoryShema');
const Author = require('../models/authorSchema');
const Review = require('../models/reviewSchema');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const bookCount = await Book.countDocuments();
    const latestBook = await Book.findOne().sort({ createdAt: -1 }).exec();

    const userCount = await User.countDocuments();
    const latestUser = await User.findOne().sort({ createdAt: -1 }).exec();

    const categoryCount = await Category.countDocuments();
    const latestCategory = await Category.findOne().sort({ createdAt: -1 }).exec();

    const authorCount = await Author.countDocuments();
    const latestAuthor = await Author.findOne().sort({ createdAt: -1 }).exec();

    const reviewCount = await Review.countDocuments();
    const latestReview = await Review.findOne().sort({ createdAt: -1 }).exec();

    res.status(200).json({
      books: { count: bookCount, latest: latestBook },
      users: { count: userCount, latest: latestUser },
      categories: { count: categoryCount, latest: latestCategory },
      authors: { count: authorCount, latest: latestAuthor },
      reviews: { count: reviewCount, latest: latestReview },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving statistics' });
  }
});

module.exports = router;
