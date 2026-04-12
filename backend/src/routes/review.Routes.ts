import express from "express";
import * as reviewController from "../controllers/review.Controller";
import authenticateUser from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/product/:productId", reviewController.getProductReviews);
router.post("/", authenticateUser, reviewController.createReview);
router.delete("/:reviewId", authenticateUser, reviewController.deleteReview);

export default router;
