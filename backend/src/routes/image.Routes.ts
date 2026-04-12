import express from "express";
import { upload, optimizeAndSave, optimizeThumbnail } from "../controllers/imageOptimization.Controller";
import authenticateUser from "../middlewares/authMiddleware";
import { authorizeRole, Roles } from "../middlewares/authorizeRole";

const router = express.Router();

router.post(
  "/upload",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  upload.single("image"),
  optimizeAndSave
);

router.post(
  "/thumbnail",
  authenticateUser,
  authorizeRole([Roles.ADMIN]),
  upload.single("image"),
  optimizeThumbnail
);

export default router;
