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
        message: "You don't have permission to perform this action.",
      });
      return;
    }

    next();
  };
};

export { Roles };
