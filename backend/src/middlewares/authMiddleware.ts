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
      .json({ message: "Please log in to continue." });
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
        .json({ message: "Your session is invalid. Please log in again." });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      ...decoded,
    };

    next();
  } catch (error: any) {
    res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};

export default authenticateUser;

/** Optional auth — attaches user if token present, but does NOT reject guests */
export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (typeof decoded === "object" && "userId" in decoded && "role" in decoded) {
      req.user = { userId: decoded.userId, role: decoded.role, ...decoded };
    }
  } catch { /* ignore invalid token for guests */ }
  next();
};
