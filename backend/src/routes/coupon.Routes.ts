import express from "express";
import * as couponController from "../controllers/coupon.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.post("/validate", authenticateUser, couponController.validateCoupon);
router.post("/", authenticateUser, authorizeRole([Roles.ADMIN]), couponController.createCoupon);
router.get("/", authenticateUser, authorizeRole([Roles.ADMIN]), couponController.getAllCoupons);
router.delete("/:id", authenticateUser, authorizeRole([Roles.ADMIN]), couponController.deleteCoupon);

export default router;
