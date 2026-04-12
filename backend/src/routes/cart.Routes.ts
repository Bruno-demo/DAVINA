import express from "express";
import * as cartController from "../controllers/cart.controller";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";
import authenticateUser from "../middlewares/authMiddleware";
import { validateAddToCart, validateUpdateCartItem } from "../validators/validate";

const router = express.Router();

router.get("/me", authenticateUser, cartController.getMyCart);
router.post("/add", authenticateUser, validateAddToCart, cartController.addItemToCart);
router.put(
  "/update",
  authenticateUser,
  validateUpdateCartItem,
  cartController.updateItemQuantity
);
router.delete(
  "/remove/:productId",
  authenticateUser,
  cartController.removeItemFromCart
);
router.delete("/clear", authenticateUser, cartController.clearCart);

router.get(
  "/",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  cartController.getAllCarts
);

export default router;
