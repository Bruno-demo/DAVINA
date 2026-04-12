import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user";
import { Roles } from "../enums/role.enum";
import Cart from "../models/cart";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLoginOtp,
} from "../services/emailService";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRE = (process.env.JWT_EXPIRE || "1h") as jwt.SignOptions["expiresIn"];
const tokenBlackList = new Set<string>();

/** In-memory OTP store: userId → { otp, expires } */
const otpStore = new Map<number, { otp: string; expires: Date }>();

/* ─────────────────────────────────────────────
   Register (with email verification)
   ───────────────────────────────────────────── */
async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Please provide your name, email address, and password." });
      return;
    }

    const existingUser = await User.findOne({ where: { u_email: email } });
    if (existingUser) {
      res.status(409).json({ message: "This email address is already in use. Please try logging in or use a different email." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    const newUser = await User.create({
      u_name: name,
      u_email: email,
      u_password: hashedPassword,
      u_role: Roles.USER,
      is_verified: false,
      verification_token: verificationToken,
      verification_expires: verificationExpires,
    });

    await Cart.create({
      user_id: newUser.u_id,
      status: "Open",
      ordered_items: [],
      total_price: 0.0,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, name, verificationToken).catch((err) =>
      console.error("[Email] Verification email error:", err.message)
    );

    res.status(201).json({
      message: "Account created. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("🔥 FULL ERROR CREATING USER:", (error as Error).message);
    res.status(500).json({ error: "Something went wrong while creating your account. Please try again." });
  }
}

/* ─────────────────────────────────────────────
   Verify Email
   ───────────────────────────────────────────── */
async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.query as { token: string };
    if (!token) {
      res.status(400).json({ message: "The verification link appears to be incomplete. Please check your email and try again." });
      return;
    }

    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      res.status(400).json({ message: "This verification link is no longer valid. Please request a new one." });
      return;
    }

    if (user.verification_expires && user.verification_expires < new Date()) {
      res.status(400).json({ message: "Verification link has expired. Please request a new one." });
      return;
    }

    await user.update({
      is_verified: true,
      verification_token: null,
      verification_expires: null,
    });

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong during email verification. Please try again." });
  }
}

/* ─────────────────────────────────────────────
   Resend Verification Email
   ───────────────────────────────────────────── */
async function resendVerificationEmail(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { u_email: email } });
    if (!user || user.is_verified) {
      // Respond generically to prevent user enumeration
      res.status(200).json({ message: "If this account exists and is unverified, a new email has been sent." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    await user.update({
      verification_token: token,
      verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    sendVerificationEmail(user.u_email, user.u_name, token).catch(() => {});
    res.status(200).json({ message: "If this account exists and is unverified, a new email has been sent." });
  } catch (error) {
    res.status(500).json({ error: "We couldn't resend the verification email. Please try again later." });
  }
}

/* ─────────────────────────────────────────────
   Login (step 1 — password check → sends OTP)
   ───────────────────────────────────────────── */
async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { u_email: email } });

    if (!user) {
      res.status(404).json({ message: "No account found with this email. Please check your email or sign up." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.u_password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "The password you entered is incorrect. Please try again." });
      return;
    }

    if (!user.is_verified) {
      res.status(403).json({
        message: "Please verify your email before logging in.",
        needsVerification: true,
      });
      return;
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    otpStore.set(user.u_id, { otp, expires });

    // Send OTP email (non-blocking)
    sendLoginOtp(user.u_email, user.u_name, otp).catch(() => {});

    res.status(200).json({
      message: "OTP sent to your email. Please enter it to complete login.",
      otpRequired: true,
      userId: user.u_id,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Something went wrong during login. Please try again." });
  }
}

/* ─────────────────────────────────────────────
   Verify OTP (step 2 — issues JWT)
   ───────────────────────────────────────────── */
async function verifyLoginOtp(req: Request, res: Response): Promise<void> {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      res.status(400).json({ message: "Please enter your verification code." });
      return;
    }

    const stored = otpStore.get(Number(userId));
    if (!stored) {
      res.status(400).json({ message: "This verification code is no longer valid. Please log in again to receive a new one." });
      return;
    }

    if (stored.expires < new Date()) {
      otpStore.delete(Number(userId));
      res.status(400).json({ message: "Your verification code has expired. Please log in again to receive a new one." });
      return;
    }

    if (stored.otp !== otp) {
      res.status(400).json({ message: "The verification code you entered is incorrect. Please check and try again." });
      return;
    }

    otpStore.delete(Number(userId));

    const user = await User.findByPk(Number(userId));
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const token = jwt.sign(
      { userId: user.u_id, role: user.u_role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while verifying your code. Please try again." });
  }
}

/* ─────────────────────────────────────────────
   Forgot Password
   ───────────────────────────────────────────── */
async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { u_email: email } });

    // Respond generically to prevent user enumeration
    const GENERIC = "If an account with that email exists, a password reset link has been sent.";
    if (!user) {
      res.status(200).json({ message: GENERIC });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    await user.update({
      reset_token: token,
      reset_token_expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    sendPasswordResetEmail(user.u_email, user.u_name, token).catch(() => {});
    res.status(200).json({ message: GENERIC });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
}

/* ─────────────────────────────────────────────
   Reset Password
   ───────────────────────────────────────────── */
async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      res.status(400).json({ message: "Please enter a new password with at least 8 characters." });
      return;
    }

    const user = await User.findOne({ where: { reset_token: token } });
    if (!user || !user.reset_token_expires || user.reset_token_expires < new Date()) {
      res.status(400).json({ message: "This password reset link is no longer valid. Please request a new one." });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    await user.update({
      u_password: hashed,
      reset_token: null,
      reset_token_expires: null,
    });

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while resetting your password. Please try again." });
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
      is_verified: user.is_verified,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "We couldn't load your account details. Please try again." });
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
      expiresIn: JWT_EXPIRE,
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
    res.status(500).json({ error: "We couldn't delete your account. Please try again later." });
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
    res.status(200).json({ message: "Invalid or expired token" });
  }
}

/* ─────────────────────────────────────────────
   Admin: Manually verify a user
   ───────────────────────────────────────────── */
async function adminVerifyUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ message: "userId is required." });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (user.is_verified) {
      res.status(400).json({ message: "User is already verified." });
      return;
    }

    await user.update({
      is_verified: true,
      verification_token: null,
      verification_expires: null,
    });

    res.status(200).json({ message: "User verified successfully." });
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).json({ error: "Failed to verify user." });
  }
}

async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await User.findAll({
      attributes: ["u_id", "u_name", "u_email", "u_role", "is_verified"],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

/* ─────────────────────────────────────────────
   Admin: Delete a user
   ───────────────────────────────────────────── */
async function adminDeleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ message: "userId is required." });
      return;
    }

    const adminId = (req as any).user.userId;
    if (Number(userId) === Number(adminId)) {
      res.status(400).json({ message: "You cannot delete your own account." });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
}

export {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  getAuthenticatedUserDetails,
  updateRole,
  adminVerifyUser,
  adminDeleteUser,
  deleteUserAccount,
  logoutUser,
  getAllUsers,
};

