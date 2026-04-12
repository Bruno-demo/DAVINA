import express from "express";
import * as newsletterController from "../controllers/newsletter.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.post("/subscribe", newsletterController.subscribe);
router.post("/unsubscribe", newsletterController.unsubscribe);
router.get(
  "/subscribers",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  newsletterController.getAllSubscribers
);

export default router;
