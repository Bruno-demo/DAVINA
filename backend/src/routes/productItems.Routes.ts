import express from "express";
import * as productItemsController from "../controllers/productItems.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.get("/", productItemsController.getAllProducts);
router.get("/:id", productItemsController.getProductById);

router.post(
  "/",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  productItemsController.createProduct
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  productItemsController.updateProduct
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  productItemsController.deleteProduct
);

export default router;
