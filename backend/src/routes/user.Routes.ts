import express from "express";
import * as userController from "../controllers/user.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.get("/login-test", (_req, res) => {
  res.json({ message: "Login route active" });
});

router.post("/", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/logout", authenticateUser, userController.logoutUser);

router.get(
  "/",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  userController.getAllUsers
);
router.get("/me", authenticateUser, userController.getAuthenticatedUserDetails);
router.put(
  "/update-role",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  userController.updateRole
);
router.delete("/me", authenticateUser, userController.deleteUserAccount);

export default router;
