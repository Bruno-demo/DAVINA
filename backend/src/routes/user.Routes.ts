import express from "express";
import * as userController from "../controllers/user.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";
import { validateRegister, validateLogin } from "../validators/validate";

const router = express.Router();

router.get("/login-test", (_req, res) => {
  res.json({ message: "Login route active" });
});

// Auth
router.post("/", validateRegister, userController.registerUser);
router.post("/login", validateLogin, userController.loginUser);
router.post("/verify-otp", userController.verifyLoginOtp);
router.post("/logout", authenticateUser, userController.logoutUser);

// Email verification
router.get("/verify-email", userController.verifyEmail);
router.post("/resend-verification", userController.resendVerificationEmail);

// Password reset
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Authenticated user
router.get("/me", authenticateUser, userController.getAuthenticatedUserDetails);
router.delete("/me", authenticateUser, userController.deleteUserAccount);

// Admin routes
router.get(
  "/",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  userController.getAllUsers
);
router.put(
  "/update-role",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  userController.updateRole
);
router.put(
  "/admin-verify",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  userController.adminVerifyUser
);
router.delete(
  "/admin-delete",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  userController.adminDeleteUser
);

export default router;
