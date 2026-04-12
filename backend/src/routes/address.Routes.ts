import express from "express";
import * as addressController from "../controllers/address.Controller";
import authenticateUser from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticateUser);

router.get("/", addressController.getAddresses);
router.post("/", addressController.createAddress);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

export default router;
