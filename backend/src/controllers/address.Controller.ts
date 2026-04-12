import { Request, Response } from "express";
import Address from "../models/address";

async function getAddresses(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const addresses = await Address.findAll({
      where: { user_id: userId },
      order: [["is_default", "DESC"], ["createdAt", "DESC"]],
    });
    res.status(200).json({ data: addresses });
  } catch (error) {
    console.error("Error fetching addresses:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch addresses." });
  }
}

async function createAddress(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const { label, first_name, last_name, street, city, postal_code, country, phone, is_default } = req.body;

    if (!first_name || !last_name || !street || !city || !postal_code) {
      res.status(400).json({ message: "first_name, last_name, street, city, and postal_code are required." });
      return;
    }

    // If setting as default, unset all other defaults
    if (is_default) {
      await Address.update({ is_default: false }, { where: { user_id: userId } });
    }

    const address = await Address.create({
      user_id: userId,
      label: label || "Home",
      first_name,
      last_name,
      street,
      city,
      postal_code,
      country: country || "Germany",
      phone,
      is_default: is_default || false,
    });

    res.status(201).json({ message: "Address created.", data: address });
  } catch (error) {
    console.error("Error creating address:", (error as Error).message);
    res.status(500).json({ error: "Failed to create address." });
  }
}

async function updateAddress(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const { id } = req.params;
    const updateData = req.body;

    const address = await Address.findOne({ where: { address_id: id, user_id: userId } });
    if (!address) {
      res.status(404).json({ message: "Address not found." });
      return;
    }

    if (updateData.is_default) {
      await Address.update({ is_default: false }, { where: { user_id: userId } });
    }

    await address.update(updateData);
    res.status(200).json({ message: "Address updated.", data: address });
  } catch (error) {
    console.error("Error updating address:", (error as Error).message);
    res.status(500).json({ error: "Failed to update address." });
  }
}

async function deleteAddress(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = (req as any).user;
    const { id } = req.params;

    const deleted = await Address.destroy({ where: { address_id: id, user_id: userId } });
    if (!deleted) {
      res.status(404).json({ message: "Address not found." });
      return;
    }

    res.status(200).json({ message: "Address deleted." });
  } catch (error) {
    console.error("Error deleting address:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete address." });
  }
}

export { getAddresses, createAddress, updateAddress, deleteAddress };
