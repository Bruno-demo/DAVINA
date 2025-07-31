import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Roles } from "./authorizeRole";

const JWT_SECRET = process.env.JWT_SECRET || "";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: Roles;
    [key: string]: any;
  };
}

const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Access denied. Token missing or malformed." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (
      typeof decoded !== "object" ||
      !("userId" in decoded) ||
      !("role" in decoded)
    ) {
      res
        .status(401)
        .json({ message: "Token payload malformed (missing userId or role)." });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      ...decoded,
    };

    next();
  } catch (error: any) {
    console.error("JWT verification failed:", error.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default authenticateUser;
