import express from "express";
import * as orderController from "../controllers/order.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.use(authenticateUser);

router.post("/from-warenkorb", orderController.createOrderFromWarenkorb);

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

export default router;
