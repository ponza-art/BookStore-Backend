const CommentReview = require("../models/reviewSchema");

exports.createCommentReview = async (req, res) => {
  try {
    const { comment, rating, bookId } = req.body;
    const userId = req.user.id;
    const newCommentReview = new CommentReview({
      comment,
      rating,
      userId,
      bookId,
    });
    await newCommentReview.save();
    res.status(201).json({
      message: "Review created successfully",
      data: newCommentReview,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error });
  }
};

exports.getAllReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const reviews = await CommentReview.find({ bookId })
      .populate("userId", "username")
      .populate("bookId", "title");
    // if (reviews.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "No reviews found for this book" });
    // }
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving reviews", error });
  }
};


// exports.getAllCommentReviews = async (req, res) => {
//   try {
//     const { bookId } = req.query;
//     let query = {};
//     if (bookId) {
//       query.bookId = bookId;
//     }
//     const commentReviews = await CommentReview.find(query)
//       .populate("userId", "name")
//       .populate("bookId", "title");
//     res.status(200).json(commentReviews);
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieving reviews", error });
//   }
// };

// exports.getCommentReviewById = async (req, res) => {
//   try {
//     const commentReview = await CommentReview.findById(req.params.id).populate(
//       "userId",
//       "username"
//     );
//     if (!commentReview)
//       return res.status(404).json({ message: "Review not found" });
//     res.status(200).json(commentReview);
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieving review", error });
//   }
// };

exports.updateCommentReview = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const commentReview = await CommentReview.findById(req.params.id);
    if (!commentReview)
      return res.status(404).json({ message: "Review not found" });
    if (commentReview.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this review" });
    }
    commentReview.comment = comment || commentReview.comment;
    commentReview.rating = rating || commentReview.rating;
    await commentReview.save();
    res.status(200).json({
      message: "Review updated successfully",
      data: commentReview,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error });
  }
};

exports.deleteCommentReview = async (req, res) => {
  try {
    const commentReview = await CommentReview.findById(req.params.id);
    if (!commentReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (commentReview.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this review" });
    }
    await CommentReview.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
};

exports.getAllReviewsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await CommentReview.find({ userId })
      .populate("bookId", "title")
      .populate("userId", "username");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user's reviews", error });
  }
};


exports.getAllReviews = async (req, res) => {
  try {
    
    const reviews = await CommentReview.find()
      .populate("bookId", "title")
      .populate("userId", "username");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving all reviews", error });
  }
};




exports.adminDeleteReview = async (req, res) => {
  try {
    const commentReview = await CommentReview.findById(req.params.id);
    if (!commentReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    await CommentReview.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
};
