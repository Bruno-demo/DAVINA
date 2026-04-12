import express from "express";
import * as giftCardController from "../controllers/giftCard.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.post("/purchase", authenticateUser, giftCardController.purchaseGiftCard);
router.get("/balance/:code", giftCardController.checkBalance);
router.post("/redeem", authenticateUser, giftCardController.redeemGiftCard);
router.get("/", authenticateUser, authorizeRole([Roles.ADMIN]), giftCardController.getAllGiftCards);

export default router;
