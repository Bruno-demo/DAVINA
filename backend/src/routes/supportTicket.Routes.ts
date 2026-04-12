import express from "express";
import * as ticketController from "../controllers/supportTicket.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { optionalAuth } from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.post("/", optionalAuth, ticketController.createTicket);
router.get("/me", authenticateUser, ticketController.getMyTickets);
router.get("/", authenticateUser, authorizeRole([Roles.ADMIN]), ticketController.getAllTickets);
router.put("/:ticketId/reply", authenticateUser, authorizeRole([Roles.ADMIN]), ticketController.replyToTicket);
router.put("/:ticketId/close", authenticateUser, ticketController.closeTicket);

export default router;
