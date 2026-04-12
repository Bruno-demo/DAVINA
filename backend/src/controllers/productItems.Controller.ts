import { Request, Response } from "express";
import ProductItem from "../models/productItems";
import { invalidateCache } from "../services/redisCache";

async function getAllProducts(req: Request, res: Response): Promise<void> {
  try {
    const { effect, skinType, search, page, limit, category, minPrice, maxPrice } = req.query;

    const filter: any = {};
    if (effect) filter.effect = effect;
    if (skinType) filter.skin_typ_target = skinType;
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }
    if (search) {
      filter.p_name = { $regex: search as string, $options: 'i' };
    }

    // Build sort object
    const { sort } = req.query;
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'price_asc': sortObj = { price: 1 }; break;
        case 'price_desc': sortObj = { price: -1 }; break;
        case 'name_asc': sortObj = { p_name: 1 }; break;
        case 'name_desc': sortObj = { p_name: -1 }; break;
        case 'newest': sortObj = { createdAt: -1 }; break;
      }
    }

    // If page/limit provided, return paginated response
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 12));
      const skip = (pageNum - 1) * limitNum;

      const [products, total] = await Promise.all([
        ProductItem.find(filter).sort(sortObj).skip(skip).limit(limitNum),
        ProductItem.countDocuments(filter),
      ]);

      res.status(200).json({
        message: "Products retrieved successfully",
        data: products,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
      return;
    }

    // No pagination — return all (backward compatible)
    const products = await ProductItem.find(filter).sort(sortObj);

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
    const { p_name, p_description, skin_typ_target, effect, price, stock, image_url, images, ingredients, category, variants } =
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
      stock: stock ?? 0,
      image_url,
      images: images || [],
      ingredients: ingredients || [],
      category: category || "general",
      variants: variants || [],
    });

    await newProduct.save();
    await invalidateCache("cache:/api/product-items*");

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

    await invalidateCache("cache:/api/product-items*");

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

    await invalidateCache("cache:/api/product-items*");

    res.status(200).json({
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error deleting product:", (error as Error).message);
    res.status(500).json({ error: "Server error while deleting product" });
  }
}

async function getRelatedProducts(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await ProductItem.findById(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const related = await ProductItem.find({
      _id: { $ne: product._id },
      $or: [
        { skin_typ_target: product.skin_typ_target },
        { effect: product.effect },
        { category: product.category },
      ],
    })
      .limit(8)
      .sort({ average_rating: -1 });

    res.status(200).json({ data: related });
  } catch (error) {
    console.error("Error fetching related products:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch related products." });
  }
}

async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await ProductItem.distinct("category");
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error("Error fetching categories:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
}

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  getCategories,
};
