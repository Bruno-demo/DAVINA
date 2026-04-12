import express from "express";
import * as analyticsController from "../controllers/analytics.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRole([Roles.ADMIN]));

router.get("/dashboard", analyticsController.getDashboardStats);
router.get("/export/orders", analyticsController.exportOrdersCsv);
router.get("/export/products", analyticsController.exportProductsCsv);
router.post("/import/products", analyticsController.bulkImportProducts);

export default router;
