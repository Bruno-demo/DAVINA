import { Request, Response } from "express";
import Cart from "../models/cart";
import Product from "../models/productItems";
import { calculateTotal } from "../utils/calculateTotal";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

async function getMyCart(req: Request, res: Response): Promise<void> {
  try {
    const user_id = (req as any).user.userId;

    let cart = await Cart.findOne({ user_id });
    if (!cart) {
      cart = new Cart({ user_id });
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("getMyCart ERROR:", error);
    res.status(500).json({ message: "We couldn't load your cart. Please try again." });
  }
}

async function addItemToCart(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const user_id = req.user!.userId;
    const { product_id, quantity } = req.body;

    if (!product_id || quantity == null) {
      res
        .status(400)
        .json({ message: "Product ID and quantity are required." });
      return;
    }

    const product = await Product.findById(product_id);
    if (!product) {
      res.status(404).json({ message: "This product is no longer available." });
      return;
    }

    let cart = await Cart.findOne({ user_id });
    if (!cart) {
      cart = new Cart({ user_id, ordered_items: [] });
    }

    const existingItem = cart.ordered_items.find(
      (item) => item.product_id.toString() === product_id
    );

    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + quantity > product.stock) {
      res.status(400).json({
        message: `Sorry, only ${product.stock - currentQty} of "${product.p_name}" left in stock.`,
      });
      return;
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.ordered_items.push({
        product_id: product._id as Types.ObjectId,
        name: product.p_name,
        price: product.price,
        quantity,
      });
    }

    const { total_price } = await calculateTotal(cart.ordered_items);
    cart.total_price = total_price;

    await cart.save();
    res.status(200).json({ message: "Product added.", cart });
  } catch (error) {
    console.error("addItemToCart ERROR:", error);
    res.status(500).json({ message: "Something went wrong while adding the product. Please try again." });
  }
}

async function updateItemQuantity(req: Request, res: Response): Promise<void> {
  try {
    const user_id = (req as any).user.userId;
    const { product_id, quantity } = req.body;

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      res.status(404).json({ message: "Cart not found." });
      return;
    }

    const itemIndex = cart.ordered_items.findIndex(
      (item) => item.product_id.toString() === product_id
    );

    if (itemIndex === -1) {
      res.status(404).json({ message: "Product not in cart." });
      return;
    }

    if (quantity === 0) {
      cart.ordered_items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(
        cart.ordered_items[itemIndex].product_id
      );
      if (product && quantity > product.stock) {
        res.status(400).json({
          message: `Sorry, only ${product.stock} of "${product.p_name}" left in stock.`,
        });
        return;
      }
      cart.ordered_items[itemIndex].quantity = quantity;
    }

    const { total_price } = await calculateTotal(cart.ordered_items);
    cart.total_price = total_price;

    await cart.save();
    res.status(200).json({ message: "Quantity updated.", cart });
  } catch (error) {
    console.error("updateItemQuantity ERROR:", error);
    res.status(500).json({ message: "Something went wrong while updating quantity. Please try again." });
  }
}

async function removeItemFromCart(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user_id = (req as any).user.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      res.status(404).json({ message: "Cart not found." });
      return;
    }

    cart.ordered_items = cart.ordered_items.filter(
      (item) => item.product_id.toString() !== productId
    );

    const { total_price } = await calculateTotal(cart.ordered_items);
    cart.total_price = total_price;

    await cart.save();
    res.status(200).json({ message: "Product removed.", cart });
  } catch (error) {
    console.error("removeItemFromCart ERROR:", error);
    res.status(500).json({ message: "Something went wrong while removing the product. Please try again." });
  }
}

async function clearCart(req: Request, res: Response): Promise<void> {
  try {
    const user_id = (req as any).user.userId;

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      res.status(404).json({ message: "Cart not found." });
      return;
    }

    cart.ordered_items = [];
    cart.total_price = 0;

    await cart.save();
    res.status(200).json({ message: "Cart cleared.", cart });
  } catch (error) {
    console.error("clearCart ERROR:", error);
    res.status(500).json({ message: "Something went wrong while clearing your cart. Please try again." });
  }
}

async function getAllCarts(_req: Request, res: Response): Promise<void> {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (error) {
    console.error("getAllCarts ERROR:", error);
    res.status(500).json({ message: "Error fetching all carts." });
  }
}

export {
  getMyCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
  getAllCarts,
};
