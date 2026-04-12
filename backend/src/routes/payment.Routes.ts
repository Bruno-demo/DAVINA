import express from "express";
import * as paymentController from "../controllers/payment.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";
import { validatePayment } from "../validators/validate";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorizeRole([Roles.ADMIN, Roles.USER]),
  validatePayment,
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

router.post(
  "/:id/refund",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  paymentController.processRefund
);

router.get(
  "/invoice/:orderId",
  authenticateUser,
  authorizeRole([Roles.ADMIN, Roles.USER]),
  paymentController.getInvoice
);

// Paystack: verify payment after redirect
router.post(
  "/paystack/verify",
  authenticateUser,
  paymentController.verifyPaystackPayment
);

// Paystack: webhook (no auth — Paystack sends this directly)
router.post(
  "/paystack/webhook",
  paymentController.paystackWebhook
);

// MoMo/Airtel: check transaction status
router.get(
  "/mobile-money/status/:transaction_id",
  authenticateUser,
  paymentController.checkMomoStatus
);

export default router;
