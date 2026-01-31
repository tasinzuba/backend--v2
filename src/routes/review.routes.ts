import { Router } from "express";
import { createReview, getMedicineReviews } from "../controllers/review.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:medicineId", getMedicineReviews);
router.post("/", authMiddleware, createReview);

export default router;
