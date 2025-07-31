import { Response, NextFunction } from "express";
import { Roles } from "../enums/role.enum";
import { AuthenticatedRequest } from "./authMiddleware";

export const authorizeRole = (roles: Roles[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        message: "Zugriff verweigert – unzureichende Berechtigungen.",
      });
      return;
    }

    next();
  };
};

export { Roles };
