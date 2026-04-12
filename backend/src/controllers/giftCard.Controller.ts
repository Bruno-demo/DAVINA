import { Request, Response } from "express";
import GiftCard from "../models/giftCard";
import crypto from "crypto";

async function purchaseGiftCard(req: Request, res: Response): Promise<void> {
  try {
    const { amount, sender_email, recipient_email, recipient_name, message } = req.body;

    if (!amount || !sender_email || !recipient_email) {
      res.status(400).json({ message: "amount, sender_email, and recipient_email are required." });
      return;
    }

    if (amount < 5 || amount > 500) {
      res.status(400).json({ message: "Gift card amount must be between RWF 5,000 and RWF 500,000." });
      return;
    }

    const code = "GC-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const expires_at = new Date();
    expires_at.setFullYear(expires_at.getFullYear() + 1);

    const giftCard = await GiftCard.create({
      code,
      initial_balance: amount,
      current_balance: amount,
      sender_email,
      recipient_email,
      recipient_name: recipient_name || "",
      message: message || "",
      expires_at,
    });

    res.status(201).json({ message: "Gift card created.", data: giftCard });
  } catch (error) {
    console.error("Error creating gift card:", (error as Error).message);
    res.status(500).json({ error: "Failed to create gift card." });
  }
}

async function checkBalance(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;
    const card = await GiftCard.findOne({ code: code.toUpperCase() });

    if (!card) {
      res.status(404).json({ message: "Gift card not found." });
      return;
    }

    if (!card.is_active) {
      res.status(400).json({ message: "This gift card has been deactivated." });
      return;
    }

    if (new Date() > card.expires_at) {
      res.status(400).json({ message: "This gift card has expired." });
      return;
    }

    res.status(200).json({ data: { code: card.code, balance: card.current_balance, expires_at: card.expires_at } });
  } catch (error) {
    console.error("Error checking gift card:", (error as Error).message);
    res.status(500).json({ error: "Failed to check gift card." });
  }
}

async function redeemGiftCard(req: Request, res: Response): Promise<void> {
  try {
    const { code, amount } = req.body;

    if (!code || !amount) {
      res.status(400).json({ message: "code and amount are required." });
      return;
    }

    const card = await GiftCard.findOne({ code: code.toUpperCase() });
    if (!card) {
      res.status(404).json({ message: "Gift card not found." });
      return;
    }

    if (!card.is_active || new Date() > card.expires_at) {
      res.status(400).json({ message: "Gift card is expired or inactive." });
      return;
    }

    if (card.current_balance < amount) {
      res.status(400).json({ message: `Insufficient balance. Available: RWF ${card.current_balance.toFixed(0)}` });
      return;
    }

    card.current_balance -= amount;
    if (card.current_balance === 0) card.is_active = false;
    await card.save();

    res.status(200).json({ message: "Gift card redeemed.", data: { remaining_balance: card.current_balance } });
  } catch (error) {
    console.error("Error redeeming gift card:", (error as Error).message);
    res.status(500).json({ error: "Failed to redeem gift card." });
  }
}

async function getAllGiftCards(_req: Request, res: Response): Promise<void> {
  try {
    const cards = await GiftCard.find().sort({ createdAt: -1 });
    res.status(200).json({ data: cards });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gift cards." });
  }
}

export { purchaseGiftCard, checkBalance, redeemGiftCard, getAllGiftCards };
