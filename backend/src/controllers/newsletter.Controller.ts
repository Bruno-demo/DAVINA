import { Request, Response } from "express";
import Newsletter from "../models/newsletter";

async function subscribe(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      res.status(400).json({ message: "Please enter a valid email address." });
      return;
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.subscribed) {
        res.status(409).json({ message: "This email address is already subscribed to our newsletter." });
        return;
      }
      existing.subscribed = true;
      existing.subscribed_at = new Date();
      existing.unsubscribed_at = undefined;
      await existing.save();
      res.status(200).json({ message: "Successfully re-subscribed." });
      return;
    }

    await Newsletter.create({ email: email.toLowerCase() });
    res.status(201).json({ message: "Successfully subscribed to newsletter." });
  } catch (error) {
    console.error("Newsletter subscribe error:", (error as Error).message);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
}

async function unsubscribe(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    const entry = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!entry || !entry.subscribed) {
      res.status(404).json({ message: "This email is not subscribed or has already been unsubscribed." });
      return;
    }

    entry.subscribed = false;
    entry.unsubscribed_at = new Date();
    await entry.save();

    res.status(200).json({ message: "Successfully unsubscribed." });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", (error as Error).message);
    res.status(500).json({ error: "Failed to unsubscribe." });
  }
}

async function getAllSubscribers(_req: Request, res: Response): Promise<void> {
  try {
    const subscribers = await Newsletter.find({ subscribed: true }).sort({ subscribed_at: -1 });
    res.status(200).json({ data: subscribers, total: subscribers.length });
  } catch (error) {
    console.error("Error fetching subscribers:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch subscribers." });
  }
}

export { subscribe, unsubscribe, getAllSubscribers };
