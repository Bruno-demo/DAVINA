import express from "express";
import * as productItemsController from "../controllers/productItems.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";
import { cacheMiddleware } from "../services/redisCache";
import { validateCreateProduct, validateUpdateProduct } from "../validators/validate";

const router = express.Router();

router.get("/", cacheMiddleware(300), productItemsController.getAllProducts);
router.get("/categories", cacheMiddleware(600), productItemsController.getCategories);
router.get("/:id", cacheMiddleware(300), productItemsController.getProductById);
router.get("/:id/related", cacheMiddleware(300), productItemsController.getRelatedProducts);

router.post(
  "/",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  validateCreateProduct,
  productItemsController.createProduct
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  validateUpdateProduct,
  productItemsController.updateProduct
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  productItemsController.deleteProduct
);

export default router;
