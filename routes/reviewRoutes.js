// routes/commentReviewRoutes.js
const express = require("express");
const router = express.Router();
const commentReviewController = require("../controllers/reviewController");
const authenticate = require("../middleware/verifyToken");
const userStatus = require("../middleware/userStatus");
const verifyAdmin = require("../middleware/verifyAdmin2");


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

router.get("/user/reviews", authenticate, commentReviewController.getAllReviewsByUser);

router.get("/all-reviews", verifyAdmin, commentReviewController.getAllReviews);

router.delete("/admin/:id", verifyAdmin, commentReviewController.adminDeleteReview);


module.exports = router;
