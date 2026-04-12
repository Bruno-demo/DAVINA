import { Request, Response } from "express";
import SupportTicket from "../models/supportTicket";

async function createTicket(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const { email, subject, message, priority } = req.body;

    if (!email || !subject || !message) {
      res.status(400).json({ message: "email, subject, and message are required." });
      return;
    }

    const ticket = await SupportTicket.create({
      user_id: userId || null,
      email,
      subject,
      message,
      priority: priority || "normal",
    });

    res.status(201).json({ message: "Ticket created.", data: ticket });
  } catch (error) {
    console.error("Error creating ticket:", (error as Error).message);
    res.status(500).json({ error: "Failed to create ticket." });
  }
}

async function getMyTickets(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const tickets = await SupportTicket.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({ data: tickets });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
}

async function getAllTickets(_req: Request, res: Response): Promise<void> {
  try {
    const tickets = await SupportTicket.findAll({ order: [["created_at", "DESC"]] });
    res.status(200).json({ data: tickets });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
}

async function replyToTicket(req: Request, res: Response): Promise<void> {
  try {
    const { ticketId } = req.params;
    const { admin_reply, status } = req.body;

    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    if (admin_reply) ticket.admin_reply = admin_reply;
    if (status) (ticket as any).status = status;
    await ticket.save();

    res.status(200).json({ message: "Ticket updated.", data: ticket });
  } catch (error) {
    res.status(500).json({ error: "Failed to update ticket." });
  }
}

async function closeTicket(req: Request, res: Response): Promise<void> {
  try {
    const { ticketId } = req.params;
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }
    (ticket as any).status = "closed";
    await ticket.save();
    res.status(200).json({ message: "Ticket closed.", data: ticket });
  } catch (error) {
    res.status(500).json({ error: "Failed to close ticket." });
  }
}

export { createTicket, getMyTickets, getAllTickets, replyToTicket, closeTicket };
