import { Router } from "express";
import {
    getPharmacistStats,
    getPharmacistMedicines,
    verifyMedicine,
    getPharmacistReviews,
} from "../controllers/pharmacist.controller.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware(["PHARMACIST", "ADMIN"]));

router.get("/stats", getPharmacistStats);
router.get("/medicines", getPharmacistMedicines);
router.patch("/medicines/:id/verify", verifyMedicine);
router.get("/reviews", getPharmacistReviews);

export default router;
