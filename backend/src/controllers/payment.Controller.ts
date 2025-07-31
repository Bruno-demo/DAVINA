import { Request, Response } from "express";
import { Roles } from "../enums/role.enum";
import Payment from "../models/payment";
import Order from "../models/order";
import Warenkorb from "../models/warenkorb";
import { StatusOrder, StatusPayment } from "../enums/status.enum";

async function makePayment(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;

    const warenkorb = await Warenkorb.findOne({ user_id: userId });

    if (!warenkorb || warenkorb.ordered_items.length === 0) {
      res.status(400).json({ message: "Warenkorb ist leer." });
      return;
    }

    const newOrder = await Order.create({
      user_id: userId,
      total_price: warenkorb.total_price,
      status: StatusOrder.PENDING,
      ordered_items: warenkorb.ordered_items,
    });

    const payment = await Payment.create({
      order_id: newOrder.order_id,
      amount: newOrder.total_price,
      status: StatusPayment.BEZAHLT,
    });

    warenkorb.ordered_items = [];
    warenkorb.total_price = 0;
    await warenkorb.save();

    res.status(201).json({
      message: "Zahlung erfolgreich durchgeführt und Bestellung erstellt.",
      order: newOrder,
      payment,
    });
  } catch (error) {
    console.error("Fehler bei Zahlung:", (error as Error).message);
    res.status(500).json({ error: "Zahlung fehlgeschlagen." });
  }
}

async function getPayments(req: Request, res: Response): Promise<void> {
  try {
    const { role, userId } = (req as any).user;

    let payments;
    if (role === Roles.ADMIN) {
      payments = await Payment.findAll({ include: Order });
    } else {
      payments = await Payment.findAll({
        include: {
          model: Order,
          where: { user_id: userId },
        },
      });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error(
      "Fehler beim Abrufen der Zahlungen:",
      (error as Error).message
    );
    res.status(500).json({ error: "Zahlungen konnten nicht geladen werden." });
  }
}

async function getPaymentById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      res.status(404).json({ message: "Zahlung nicht gefunden." });
      return;
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Fehler bei getPaymentById:", (error as Error).message);
    res.status(500).json({ error: "Fehler beim Abrufen der Zahlung." });
  }
}

export { makePayment, getPayments, getPaymentById };
