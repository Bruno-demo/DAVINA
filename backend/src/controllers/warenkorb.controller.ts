import { Request, Response } from "express";
import Warenkorb from "../models/warenkorb";
import Product from "../models/productItems";
import { calculateTotal } from "../utils/calculateTotal";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

async function getMyWarenkorb(req: Request, res: Response): Promise<void> {
  try {
    const user_id = (req as any).user.userId;

    let warenkorb = await Warenkorb.findOne({ user_id });
    if (!warenkorb) {
      warenkorb = new Warenkorb({ user_id });
      await warenkorb.save();
    }

    res.status(200).json(warenkorb);
  } catch (error) {
    console.error("getMyWarenkorb ERROR:", error);
    res.status(500).json({ message: "Serverfehler beim Abrufen" });
  }
}

async function addItemToWarenkorb(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const user_id = req.user!.userId;
    const { product_id, quantity } = req.body;

    if (!product_id || quantity == null) {
      res
        .status(400)
        .json({ message: "Produkt-ID und Menge sind erforderlich" });
      return;
    }

    const product = await Product.findById(product_id);
    if (!product) {
      res.status(404).json({ message: "Produkt nicht gefunden" });
      return;
    }

    let warenkorb = await Warenkorb.findOne({ user_id });
    if (!warenkorb) {
      warenkorb = new Warenkorb({ user_id, ordered_items: [] });
    }

    const existingItem = warenkorb.ordered_items.find(
      (item) => item.product_id.toString() === product_id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      warenkorb.ordered_items.push({
        product_id: product._id as Types.ObjectId,
        name: product.p_name,
        price: product.price,
        quantity,
      });
    }

    const { total_price } = await calculateTotal(warenkorb.ordered_items);
    warenkorb.total_price = total_price;

    await warenkorb.save();
    res.status(200).json({ message: "Produkt hinzugefügt", warenkorb });
  } catch (error) {
    console.error("addItemToWarenkorb ERROR:", error);
    res.status(500).json({ message: "Fehler beim Hinzufügen" });
  }
}

async function updateItemQuantity(req: Request, res: Response): Promise<void> {
  try {
    const user_id = (req as any).user.userId;
    const { product_id, quantity } = req.body;

    const warenkorb = await Warenkorb.findOne({ user_id });
    if (!warenkorb) {
      res.status(404).json({ message: "Kein Warenkorb gefunden" });
      return;
    }

    const itemIndex = warenkorb.ordered_items.findIndex(
      (item) => item.product_id.toString() === product_id
    );

    if (itemIndex === -1) {
      res.status(404).json({ message: "Produkt nicht im Warenkorb" });
      return;
    }

    if (quantity === 0) {
      warenkorb.ordered_items.splice(itemIndex, 1);
    } else {
      warenkorb.ordered_items[itemIndex].quantity = quantity;
    }

    const { total_price } = await calculateTotal(warenkorb.ordered_items);
    warenkorb.total_price = total_price;

    await warenkorb.save();
    res.status(200).json({ message: "Menge aktualisiert", warenkorb });
  } catch (error) {
    console.error("updateItemQuantity ERROR:", error);
    res.status(500).json({ message: "Fehler beim Aktualisieren" });
  }
}

async function removeItemFromWarenkorb(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user_id = (req as any).user.userId;
    const { productId } = req.params;

    const warenkorb = await Warenkorb.findOne({ user_id });
    if (!warenkorb) {
      res.status(404).json({ message: "Kein Warenkorb gefunden" });
      return;
    }

    warenkorb.ordered_items = warenkorb.ordered_items.filter(
      (item) => item.product_id.toString() !== productId
    );

    const { total_price } = await calculateTotal(warenkorb.ordered_items);
    warenkorb.total_price = total_price;

    await warenkorb.save();
    res.status(200).json({ message: "Produkt entfernt", warenkorb });
  } catch (error) {
    console.error("removeItemFromWarenkorb ERROR:", error);
    res.status(500).json({ message: "Fehler beim Entfernen" });
  }
}

async function clearWarenkorb(req: Request, res: Response): Promise<void> {
  try {
    const user_id = (req as any).user.userId;

    const warenkorb = await Warenkorb.findOne({ user_id });
    if (!warenkorb) {
      res.status(404).json({ message: "Kein Warenkorb gefunden" });
      return;
    }

    warenkorb.ordered_items = [];
    warenkorb.total_price = 0;

    await warenkorb.save();
    res.status(200).json({ message: "Warenkorb geleert", warenkorb });
  } catch (error) {
    console.error("clearWarenkorb ERROR:", error);
    res.status(500).json({ message: "Fehler beim Leeren des Warenkorbs" });
  }
}

async function getAllWarenkorbs(_req: Request, res: Response): Promise<void> {
  try {
    const warenkorbs = await Warenkorb.find();
    res.status(200).json(warenkorbs);
  } catch (error) {
    console.error("getAllWarenkorbs ERROR:", error);
    res.status(500).json({ message: "Fehler beim Abrufen aller Warenkörbe" });
  }
}

export {
  getMyWarenkorb,
  addItemToWarenkorb,
  updateItemQuantity,
  removeItemFromWarenkorb,
  clearWarenkorb,
  getAllWarenkorbs,
};
