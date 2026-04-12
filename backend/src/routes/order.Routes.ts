import express from "express";
import * as orderController from "../controllers/order.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { optionalAuth } from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";
import { validateGuestOrder } from "../validators/validate";

const router = express.Router();

// Guest checkout — optionalAuth allows unauthenticated users
router.post("/guest", optionalAuth, validateGuestOrder, orderController.createGuestOrder);

// All other order routes require authentication
router.use(authenticateUser);

router.post("/from-cart", orderController.createOrderFromCart);

router.get("/me", orderController.getOrdersByUser);

router.put(
  "/:orderId/status",
  authorizeRole([Roles.ADMIN]),
  orderController.updateOrderStatus
);

router.delete(
  "/:orderId",
  authorizeRole([Roles.ADMIN, Roles.USER]),
  orderController.deleteOrder
);

router.get("/", authorizeRole([Roles.ADMIN]), orderController.getAllOrders);

// Tracking info for a specific order
router.get("/:orderId/tracking", orderController.getTrackingInfo);

export default router;
