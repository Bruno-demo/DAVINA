import { Request, Response } from "express";
import Wishlist from "../models/wishlist";
import ProductItem from "../models/productItems";

async function getWishlist(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    let wishlist = await Wishlist.findOne({ user_id: userId }).populate("items.product_id");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id: userId, items: [] });
    }
    res.status(200).json({ data: wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch wishlist." });
  }
}

async function addToWishlist(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const { product_id } = req.body;

    if (!product_id) {
      res.status(400).json({ message: "product_id is required." });
      return;
    }

    const product = await ProductItem.findById(product_id);
    if (!product) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    let wishlist = await Wishlist.findOne({ user_id: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id: userId, items: [] });
    }

    const exists = wishlist.items.some((item) => item.product_id.toString() === product_id);
    if (exists) {
      res.status(409).json({ message: "Product already in wishlist." });
      return;
    }

    wishlist.items.push({ product_id, added_at: new Date() });
    await wishlist.save();

    res.status(200).json({ message: "Added to wishlist.", data: wishlist });
  } catch (error) {
    console.error("Error adding to wishlist:", (error as Error).message);
    res.status(500).json({ error: "Failed to add to wishlist." });
  }
}

async function removeFromWishlist(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const { product_id } = req.params;

    const wishlist = await Wishlist.findOne({ user_id: userId });
    if (!wishlist) {
      res.status(404).json({ message: "Wishlist not found." });
      return;
    }

    wishlist.items = wishlist.items.filter((item) => item.product_id.toString() !== product_id);
    await wishlist.save();

    res.status(200).json({ message: "Removed from wishlist.", data: wishlist });
  } catch (error) {
    console.error("Error removing from wishlist:", (error as Error).message);
    res.status(500).json({ error: "Failed to remove from wishlist." });
  }
}

export { getWishlist, addToWishlist, removeFromWishlist };
