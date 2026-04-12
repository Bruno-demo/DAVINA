import express from "express";
import * as wishlistController from "../controllers/wishlist.Controller";
import authenticateUser from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticateUser);

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addToWishlist);
router.delete("/:product_id", wishlistController.removeFromWishlist);

export default router;
