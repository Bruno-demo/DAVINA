import { Request, Response } from "express";
import ReturnRequest from "../models/returnRequest";
import Order from "../models/order";
import { StatusReturn, StatusOrder } from "../enums/status.enum";
import { Roles } from "../enums/role.enum";

async function createReturnRequest(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const { order_id, reason } = req.body;

    if (!order_id || !reason) {
      res.status(400).json({ message: "order_id and reason are required." });
      return;
    }

    const order = await Order.findOne({ where: { order_id, user_id: userId } });
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    if (order.status !== StatusOrder.DELIVERED) {
      res.status(400).json({ message: "Only delivered orders can be returned." });
      return;
    }

    const existing = await ReturnRequest.findOne({ where: { order_id, user_id: userId } });
    if (existing) {
      res.status(409).json({ message: "Return request already exists for this order." });
      return;
    }

    const returnReq = await ReturnRequest.create({
      order_id,
      user_id: userId,
      reason,
      status: StatusReturn.PENDING,
    });

    res.status(201).json({ message: "Return request created.", data: returnReq });
  } catch (error) {
    console.error("Error creating return request:", (error as Error).message);
    res.status(500).json({ error: "Failed to create return request." });
  }
}

async function getMyReturnRequests(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const returns = await ReturnRequest.findAll({
      where: { user_id: userId },
      include: [Order],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ data: returns });
  } catch (error) {
    console.error("Error fetching return requests:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch return requests." });
  }
}

async function getAllReturnRequests(_req: Request, res: Response): Promise<void> {
  try {
    const returns = await ReturnRequest.findAll({
      include: [Order],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ data: returns });
  } catch (error) {
    console.error("Error fetching all return requests:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch return requests." });
  }
}

async function updateReturnStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!Object.values(StatusReturn).includes(status)) {
      res.status(400).json({
        message: `Invalid status. Allowed: ${Object.values(StatusReturn).join(", ")}`,
      });
      return;
    }

    const returnReq = await ReturnRequest.findByPk(id);
    if (!returnReq) {
      res.status(404).json({ message: "Return request not found." });
      return;
    }

    await returnReq.update({ status, admin_notes });

    if (status === StatusReturn.APPROVED) {
      await Order.update({ status: StatusOrder.RETURNED }, { where: { order_id: returnReq.order_id } });
    }

    res.status(200).json({ message: "Return request updated.", data: returnReq });
  } catch (error) {
    console.error("Error updating return request:", (error as Error).message);
    res.status(500).json({ error: "Failed to update return request." });
  }
}

export { createReturnRequest, getMyReturnRequests, getAllReturnRequests, updateReturnStatus };
