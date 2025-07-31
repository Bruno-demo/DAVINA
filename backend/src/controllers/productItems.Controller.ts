import { Request, Response } from "express";
import ProductItem from "../models/productItems";

async function getAllProducts(req: Request, res: Response): Promise<void> {
  try {
    const { effect, skinType } = req.query;

    const filter: any = {};
    if (effect) filter.effect = effect;
    if (skinType) filter.skin_typ_target = skinType;

    const products = await ProductItem.find(filter);

    res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", (error as Error).message);
    res.status(500).json({ error: "Server error while fetching products" });
  }
}

async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const product = await ProductItem.findById(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", (error as Error).message);
    res.status(500).json({ error: "Server error while fetching product" });
  }
}

async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const { p_name, p_description, skin_typ_target, effect, price, image_url } =
      req.body;

    if (!p_name || !skin_typ_target || !effect || !price || !image_url) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newProduct = new ProductItem({
      p_name,
      p_description,
      skin_typ_target,
      effect,
      price,
      image_url,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", (error as Error).message);
    res.status(500).json({ error: "Server error while creating product" });
  }
}

async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await ProductItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", (error as Error).message);
    res.status(500).json({ error: "Server error while updating product" });
  }
}

async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const product = await ProductItem.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error deleting product:", (error as Error).message);
    res.status(500).json({ error: "Server error while deleting product" });
  }
}

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
