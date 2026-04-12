import { Request, Response } from "express";
import Review from "../models/review";
import ProductItem from "../models/productItems";

async function getProductReviews(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find({ product_id: productId }).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Review.countDocuments({ product_id: productId }),
    ]);

    res.status(200).json({
      data: reviews,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching reviews:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
}

async function createReview(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const { product_id, rating, title, comment, user_name } = req.body;

    if (!product_id || !rating || !title || !comment) {
      res.status(400).json({ message: "product_id, rating, title, and comment are required." });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5." });
      return;
    }

    const product = await ProductItem.findById(product_id);
    if (!product) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    // Check for existing review
    const existing = await Review.findOne({ user_id: userId, product_id });
    if (existing) {
      res.status(409).json({ message: "You have already reviewed this product." });
      return;
    }

    const review = await Review.create({
      user_id: userId,
      user_name: user_name || "Anonymous",
      product_id,
      rating,
      title,
      comment,
    });

    // Update product average rating
    const stats = await Review.aggregate([
      { $match: { product_id: product._id } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      product.average_rating = Math.round(stats[0].avg * 10) / 10;
      product.review_count = stats[0].count;
      await product.save();
    }

    res.status(201).json({ message: "Review created.", data: review });
  } catch (error) {
    console.error("Error creating review:", (error as Error).message);
    res.status(500).json({ error: "Failed to create review." });
  }
}

async function deleteReview(req: Request, res: Response): Promise<void> {
  try {
    const { userId, role } = (req as any).user;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: "Review not found." });
      return;
    }

    if (review.user_id !== userId && role !== "admin") {
      res.status(403).json({ message: "Not authorized to delete this review." });
      return;
    }

    const productId = review.product_id;
    await review.deleteOne();

    // Update product average rating
    const stats = await Review.aggregate([
      { $match: { product_id: productId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const product = await ProductItem.findById(productId);
    if (product) {
      product.average_rating = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : 0;
      product.review_count = stats.length > 0 ? stats[0].count : 0;
      await product.save();
    }

    res.status(200).json({ message: "Review deleted." });
  } catch (error) {
    console.error("Error deleting review:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete review." });
  }
}

export { getProductReviews, createReview, deleteReview };
