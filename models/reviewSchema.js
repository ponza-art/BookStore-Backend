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
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },
    // updatedAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  { timestamps: true }
);

// commentReviewSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

const CommentReview = mongoose.model("CommentReview", commentReviewSchema);
module.exports = CommentReview;
