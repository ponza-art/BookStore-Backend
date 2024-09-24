// models/commentReview.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentReviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
  },
  { timestamps: true }
);

const CommentReview = mongoose.model("CommentReview", commentReviewSchema);
module.exports = CommentReview;
