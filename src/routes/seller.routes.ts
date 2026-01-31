import { Router } from "express";
import {
    addMedicine,
    getSellerMedicines,
    updateMedicine,
    deleteMedicine,
    getSellerOrders,
    updateOrderStatus
} from "../controllers/seller.controller.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { medicineSchema } from "../validators/schemas.js";

const router = Router();

router.use(authMiddleware, roleMiddleware(["SELLER"]));

router.post("/medicines", validate(medicineSchema), addMedicine);
router.get("/medicines", getSellerMedicines);
router.put("/medicines/:id", updateMedicine); // Partial updates might need a different schema or allow partial
router.delete("/medicines/:id", deleteMedicine);

router.get("/orders", getSellerOrders);
router.patch("/orders/:id", updateOrderStatus);

export default router;
