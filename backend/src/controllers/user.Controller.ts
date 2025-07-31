import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { Roles } from "../enums/role.enum";
import Warenkorb from "../models/warenkorb";
const JWT_SECRET = process.env.JWT_SECRET || "";
const tokenBlackList = new Set<string>();

async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, Email, or Password is missing." });
      return;
    }

    const existingUser = await User.findOne({ where: { u_email: email } });
    if (existingUser) {
      res.status(409).json({ message: "The user is already registered." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      u_name: name,
      u_email: email,
      u_password: hashedPassword,
      u_role: Roles.USER,
    });

    await Warenkorb.create({
      user_id: newUser.u_id,
      status: "Offen",
      ordered_items: [],
      total_price: 0.0,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("🔥 FULL ERROR CREATING USER:", (error as Error).message);
    res.status(500).json({ error: "Failed to create user" });
  }
}

async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { u_email: email } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.u_password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      { userId: user.u_id, role: user.u_role },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to log in user" });
  }
}

async function getAuthenticatedUserDetails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      user_id: user.u_id,
      name: user.u_name,
      email: user.u_email,
      role: user.u_role,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
}

async function updateRole(req: Request, res: Response): Promise<void> {
  try {
    const { userId, newRole } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!Object.values(Roles).includes(newRole)) {
      res.status(400).json({
        error: `Invalid role. Allowed values are ${Object.values(Roles).join(", ")}`,
      });
      return;
    }

    await User.update({ u_role: newRole }, { where: { u_id: userId } });

    const token = jwt.sign({ userId: user.u_id, role: newRole }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Role updated successfully",
      user: { id: user.u_id, role: newRole },
      token,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
}

async function deleteUserAccount(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    await User.destroy({ where: { u_id: userId } });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete account" });
  }
}

function logoutUser(req: Request, res: Response): void {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(400).json({ message: "Token is missing" });
    return;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    tokenBlackList.add(token);
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(200).json({ message: "Invalid or expired token" });
  }
}

async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await User.findAll({
      attributes: ["u_id", "u_name", "u_email", "u_role"],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("...Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export {
  registerUser,
  loginUser,
  getAuthenticatedUserDetails,
  updateRole,
  deleteUserAccount,
  logoutUser,
  getAllUsers,
};
