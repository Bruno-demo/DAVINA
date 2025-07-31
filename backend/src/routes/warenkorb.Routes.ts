import express from "express";
import * as warenkorbController from "../controllers/warenkorb.controller";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";
import authenticateUser from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/me", authenticateUser, warenkorbController.getMyWarenkorb);
router.post("/add", authenticateUser, warenkorbController.addItemToWarenkorb);
router.put(
  "/update",
  authenticateUser,
  warenkorbController.updateItemQuantity
);
router.delete(
  "/remove/:productId",
  authenticateUser,
  warenkorbController.removeItemFromWarenkorb
);
router.delete("/clear", authenticateUser, warenkorbController.clearWarenkorb);

router.get(
  "/",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  warenkorbController.getAllWarenkorbs
);

export default router;
