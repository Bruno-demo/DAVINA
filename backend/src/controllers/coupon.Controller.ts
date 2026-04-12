import { Request, Response } from "express";
import Coupon from "../models/coupon";

async function validateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { code, order_total } = req.body;

    if (!code) {
      res.status(400).json({ message: "Coupon code is required." });
      return;
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      res.status(404).json({ message: "Invalid or expired coupon code." });
      return;
    }

    if (coupon.expires_at < new Date()) {
      res.status(400).json({ message: "This coupon has expired." });
      return;
    }

    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      res.status(400).json({ message: "This coupon has reached its usage limit." });
      return;
    }

    if (order_total && order_total < coupon.min_order_amount) {
      res.status(400).json({
        message: `Minimum order amount of RWF ${coupon.min_order_amount} required for this coupon.`,
      });
      return;
    }

    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (order_total || 0) * (coupon.discount_value / 100);
    } else {
      discount = coupon.discount_value;
    }

    res.status(200).json({
      message: "Coupon is valid.",
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        calculated_discount: Math.round(discount * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", (error as Error).message);
    res.status(500).json({ error: "Failed to validate coupon." });
  }
}

async function createCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { code, discount_type, discount_value, min_order_amount, max_uses, expires_at } = req.body;

    if (!code || !discount_type || !discount_value || !expires_at) {
      res.status(400).json({ message: "code, discount_type, discount_value, and expires_at are required." });
      return;
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      res.status(409).json({ message: "Coupon code already exists." });
      return;
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      min_order_amount: min_order_amount || 0,
      max_uses: max_uses || 0,
      expires_at: new Date(expires_at),
    });

    res.status(201).json({ message: "Coupon created.", data: coupon });
  } catch (error) {
    console.error("Error creating coupon:", (error as Error).message);
    res.status(500).json({ error: "Failed to create coupon." });
  }
}

async function getAllCoupons(_req: Request, res: Response): Promise<void> {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ data: coupons });
  } catch (error) {
    console.error("Error fetching coupons:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch coupons." });
  }
}

async function deleteCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      res.status(404).json({ message: "Coupon not found." });
      return;
    }
    res.status(200).json({ message: "Coupon deleted." });
  } catch (error) {
    console.error("Error deleting coupon:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete coupon." });
  }
}

export { validateCoupon, createCoupon, getAllCoupons, deleteCoupon };
