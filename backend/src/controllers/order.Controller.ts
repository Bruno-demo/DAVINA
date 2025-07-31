import { Request, Response } from "express";
import Order from "../models/order";
import Warenkorb from "../models/warenkorb";
import { Roles } from "../enums/role.enum";
import { StatusKorb, StatusOrder } from "../enums/status.enum";
import { calculateTotal } from "../utils/calculateTotal";

async function createOrderFromWarenkorb(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user_id = (req as any).user.userId;

    const warenkorb = await Warenkorb.findOne({ user_id });
    if (!warenkorb || warenkorb.ordered_items.length === 0) {
      res.status(400).json({ message: "Dein Warenkorb ist leer." });
      return;
    }

    const { total_price, processedItems } = await calculateTotal(
      warenkorb.ordered_items
    );

    const order = await Order.create({
      user_id,
      ordered_items: processedItems,
      total_price,
      status: StatusOrder.PENDING,
    });

    warenkorb.ordered_items = [];
    warenkorb.total_price = 0;
    warenkorb.status = StatusKorb.ABGELAUFEN;
    await warenkorb.save();

    res.status(201).json({
      message: "Bestellung erfolgreich erstellt.",
      order,
    });
  } catch (error) {
    console.error("createOrderFromWarenkorb ERROR:", (error as Error).message);
    res
      .status(500)
      .json({ error: "Interner Fehler beim Erstellen der Bestellung." });
  }
}

async function getOrdersByUser(req: Request, res: Response): Promise<void> {
  try {
    const user_id = (req as any).user.userId;

    const orders = await Order.findAll({
      where: { user_id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("getOrdersByUser ERROR:", (error as Error).message);
    res.status(500).json({ error: "Fehler beim Laden der Bestellungen." });
  }
}

async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if ((req as any).user.role !== Roles.ADMIN) {
      res.status(403).json({ message: "Nur Admins dürfen den Status ändern." });
      return;
    }

    if (!Object.values(StatusOrder).includes(status)) {
      res.status(400).json({
        message: `Ungültiger Status. Erlaubte Werte: ${Object.values(StatusOrder).join(", ")}`,
      });
      return;
    }

    const updated = await Order.update(
      { status },
      { where: { order_id: orderId } }
    );

    if (updated[0] === 0) {
      res.status(404).json({ message: "Bestellung nicht gefunden." });
      return;
    }

    res.status(200).json({ message: "Status erfolgreich geändert." });
  } catch (error) {
    console.error("updateOrderStatus ERROR:", (error as Error).message);
    res.status(500).json({ error: "Status konnte nicht geändert werden." });
  }
}

async function deleteOrder(req: Request, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      res.status(404).json({ message: "Bestellung nicht gefunden." });
      return;
    }

    const user = (req as any).user;
    if (user.role !== Roles.ADMIN && user.userId !== order.user_id) {
      res
        .status(403)
        .json({ message: "Nicht berechtigt, diese Bestellung zu löschen." });
      return;
    }

    await order.destroy();
    res.status(200).json({ message: "Bestellung erfolgreich gelöscht." });
  } catch (error) {
    console.error("deleteOrder ERROR:", (error as Error).message);
    res.status(500).json({ error: "Fehler beim Löschen der Bestellung." });
  }
}

async function getAllOrders(_req: Request, res: Response): Promise<void> {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("getAllOrders ERROR:", (error as Error).message);
    res.status(500).json({ error: "Fehler beim Laden der Bestellungen." });
  }
}

export {
  createOrderFromWarenkorb,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
  getAllOrders,
};
