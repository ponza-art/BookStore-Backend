// routes/commentReviewRoutes.js
const express = require("express");
const router = express.Router();
const commentReviewController = require("../controllers/reviewController");
const authenticate = require("../middleware/verifyToken");
const userStatus = require("../middleware/userStatus");

router.post("/", authenticate,userStatus, commentReviewController.createCommentReview);
router.put("/:id", authenticate,userStatus, commentReviewController.updateCommentReview);
router.delete(
  "/:id",
  authenticate,
  commentReviewController.deleteCommentReview
);
router.get("/:bookId/reviews", commentReviewController.getAllReviewsByBook);

// router.get("/", authenticate, commentReviewController.getAllCommentReviews);

// router.get("/:id", commentReviewController.getCommentReviewById);

module.exports = router;
