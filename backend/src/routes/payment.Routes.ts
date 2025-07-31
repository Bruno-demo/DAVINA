import express from "express";
import * as paymentController from "../controllers/payment.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorizeRole([Roles.ADMIN, Roles.USER]),
  paymentController.makePayment
);

router.get(
  "/",
  authenticateUser,
  authorizeRole([Roles.ADMIN, Roles.USER]),
  paymentController.getPayments
);

router.get(
  "/:id",
  authenticateUser,
  authorizeRole([Roles.ADMIN, Roles.USER]),
  paymentController.getPaymentById
);

export default router;
