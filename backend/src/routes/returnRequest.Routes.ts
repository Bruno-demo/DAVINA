import express from "express";
import * as returnController from "../controllers/returnRequest.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.use(authenticateUser);

router.post("/", returnController.createReturnRequest);
router.get("/me", returnController.getMyReturnRequests);
router.get("/", authorizeRole([Roles.ADMIN]), returnController.getAllReturnRequests);
router.put("/:id/status", authorizeRole([Roles.ADMIN]), returnController.updateReturnStatus);

export default router;
